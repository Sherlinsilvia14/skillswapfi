import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socket';
import { showToast } from '../utils/helpers';
import './VideoCall.css';

const VideoCall = ({ session, user, onEndCall, onComplete }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sessionNotes, setSessionNotes] = useState([]);
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    initializeCall();
    startTimer();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeCall = async () => {
    try {
      console.log('Requesting camera and microphone access...');
      
      // Get user media with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('Media stream obtained:', stream);

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        // Ensure video plays
        localVideoRef.current.play().catch(err => {
          console.error('Error playing local video:', err);
        });
      }

      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' ');
          setTranscript(transcript);
        };

        recognition.onend = () => {
          const note = transcript.trim();
          if (note) {
            setSessionNotes(prev => [...prev, note]);
            setTranscript('');
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      // Setup WebRTC
      setupWebRTC(stream);
      setIsCallActive(true);
      showToast('Call started successfully!', 'success');
    } catch (error) {
      console.error('Failed to initialize call:', error);
      
      let errorMessage = 'Failed to access camera/microphone';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera/Microphone permission denied. Please allow access and refresh.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found. Please connect a device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera/Microphone is being used by another application.';
      }
      
      setPermissionError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const setupWebRTC = (stream) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0]);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        // Ensure video plays
        remoteVideoRef.current.play().catch(err => {
          console.error('Error playing remote video:', err);
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        showToast('Connected to peer!', 'success');
      } else if (peerConnection.connectionState === 'failed') {
        showToast('Connection failed. Please refresh and try again.', 'error');
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate');
        const otherUserId = session.teacher._id === user._id 
          ? session.learner._id 
          : session.teacher._id;
        socketService.sendIceCandidate(otherUserId, event.candidate);
      }
    };

    // Socket event listeners
    socketService.onIncomingCall(async (data) => {
      try {
        console.log('📞 Incoming call from:', data.from);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socketService.answerCall(data.from, answer);
        console.log('✅ Answer sent back');
      } catch (error) {
        console.error('Error handling incoming call:', error);
      }
    });

    socketService.onCallAnswered(async (data) => {
      try {
        console.log('✅ Call answered by peer');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    socketService.onIceCandidate((data) => {
      try {
        console.log('🧊 Received ICE candidate');
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    // Join room and initiate call if teacher
    const roomId = session._id;
    socketService.joinRoom(roomId);
    
    // If teacher, create and send offer
    if (session.teacher._id === user._id) {
      setTimeout(async () => {
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socketService.callUser(session.learner._id, offer, roomId);
          console.log('Offer sent to learner');
        } catch (error) {
          console.error('Error creating offer:', error);
        }
      }, 1000);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current
          .getSenders()
          .find(s => s.track.kind === 'video');

        sender.replaceTrack(screenTrack);
        
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerConnectionRef.current
          .getSenders()
          .find(s => s.track.kind === 'video');

        sender.replaceTrack(videoTrack);
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Screen share error:', error);
      showToast('Failed to share screen', 'error');
    }
  };

  const downloadNotes = () => {
    const notesText = sessionNotes.join('\n\n');
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-notes-${session.skill}-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Notes downloaded!', 'success');
  };

  const handleEndCall = () => {
    const isTeacher = session.teacher._id === user._id;
    
    if (isTeacher) {
      onComplete(session._id, Math.floor(duration / 60));
    } else {
      cleanup();
      onEndCall();
    }
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    socketService.leaveRoom(session.roomId);
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-call-container">
      <div className="video-call-header">
        <div className="call-info">
          <h2>Session: {session.skill}</h2>
          <span className="call-duration">{formatDuration(duration)}</span>
        </div>
      </div>

      {permissionError && (
        <div className="permission-error-banner">
          <span>⚠️ {permissionError}</span>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      )}

      <div className="video-grid">
        <div className="video-box remote">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            controls={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <span className="video-label">
            {session.teacher._id === user._id ? session.learner.name : session.teacher.name}
          </span>
        </div>

        <div className="video-box local">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            controls={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <span className="video-label">You</span>
          {isVideoOff && <div className="video-off-overlay">Camera Off</div>}
        </div>
      </div>

      <div className="video-controls">
        <button
          className={`control-btn ${isMuted ? 'active' : ''}`}
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>

        <button
          className={`control-btn ${isVideoOff ? 'active' : ''}`}
          onClick={toggleVideo}
          title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
        >
          {isVideoOff ? '📷' : '📹'}
        </button>

        <button
          className={`control-btn ${isScreenSharing ? 'active' : ''}`}
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          🖥️
        </button>

        <button
          className="control-btn end-call"
          onClick={handleEndCall}
          title="End Call"
        >
          📞
        </button>
      </div>

      <div className="session-notes-panel">
        <div className="notes-header">
          <h3>Session Notes (Auto-captured)</h3>
          {sessionNotes.length > 0 && (
            <button className="btn btn-sm btn-secondary" onClick={downloadNotes}>
              Download Notes
            </button>
          )}
        </div>

        <div className="notes-content">
          {transcript && (
            <div className="current-transcript">
              <strong>Current:</strong> {transcript}
            </div>
          )}
          
          {sessionNotes.map((note, index) => (
            <div key={index} className="note-item">
              <span className="note-number">{index + 1}.</span>
              <span>{note}</span>
            </div>
          ))}

          {sessionNotes.length === 0 && !transcript && (
            <p className="notes-empty">
              Start speaking to auto-generate notes using speech recognition
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
