import React, { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/api';
import socketService from '../services/socket';
import { showToast, timeAgo, getInitials } from '../utils/helpers';
import './Chat.css';

const Chat = ({ user, selectedChatUser }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatbotMode, setChatbotMode] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    setupSocket();

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    // If a chat user is passed from parent (from Search page), select them
    if (selectedChatUser) {
      setSelectedUser(selectedChatUser);
      setChatbotMode(false);
    }
  }, [selectedChatUser]);

  useEffect(() => {
    if (selectedUser && selectedUser._id !== 'chatbot') {
      fetchMessages(selectedUser._id);
      markAsRead(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocket = () => {
    socketService.connect(user._id);

    socketService.onReceiveMessage((message) => {
      if (selectedUser && 
          (message.sender._id === selectedUser._id || message.receiver._id === selectedUser._id)) {
        setMessages(prev => [...prev, message]);
        markAsRead(message.sender._id);
      }
      fetchConversations();
    });

    socketService.onUserTyping((data) => {
      if (selectedUser && data.userId === selectedUser._id) {
        setIsTyping(data.isTyping);
      }
    });

    socketService.onChatbotResponse((data) => {
      const botMessage = {
        sender: { name: 'SkillBot', profileImage: null },
        content: data.response,
        createdAt: new Date(),
        isBot: true
      };
      setMessages(prev => [...prev, botMessage]);
    });
  };

  const fetchConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await messageAPI.getChatHistory(userId);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      showToast('Failed to load messages', 'error');
    }
  };

  const markAsRead = async (userId) => {
    try {
      await messageAPI.markAsRead(userId);
      fetchConversations();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    if (chatbotMode) {
      // Add user message to UI
      const userMessage = {
        sender: user,
        content: newMessage,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Send to chatbot
      socketService.sendChatbotMessage(newMessage);
      setNewMessage('');
      return;
    }

    if (!selectedUser) return;

    const messageData = {
      senderId: user._id,
      receiverId: selectedUser._id,
      content: newMessage
    };

    // Optimistic update
    const tempMessage = {
      sender: user,
      receiver: selectedUser,
      content: newMessage,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, tempMessage]);

    socketService.sendMessage(messageData);
    setNewMessage('');
  };

  const handleTyping = () => {
    if (selectedUser && !chatbotMode) {
      socketService.sendTyping(selectedUser._id, user._id);
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(selectedUser._id, user._id);
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activateChatbot = () => {
    setChatbotMode(true);
    setSelectedUser({ 
      name: 'SkillBot', 
      _id: 'chatbot',
      profileImage: null 
    });
    setMessages([{
      sender: { name: 'SkillBot', profileImage: null },
      content: 'Hello! I\'m SkillBot, your assistant. How can I help you today?',
      createdAt: new Date(),
      isBot: true
    }]);
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
          <button className="btn-chatbot" onClick={activateChatbot}>
            🤖 Chatbot
          </button>
        </div>

        <div className="conversations-list">
          {chatbotMode && (
            <div 
              className="conversation-item active"
              onClick={() => setChatbotMode(true)}
            >
              <div className="conversation-avatar">
                <div className="avatar-placeholder">🤖</div>
              </div>
              <div className="conversation-info">
                <h4>SkillBot</h4>
                <p>Your AI Assistant</p>
              </div>
            </div>
          )}

          {conversations.map(conv => (
            <div
              key={conv.user._id}
              className={`conversation-item ${selectedUser?._id === conv.user._id ? 'active' : ''}`}
              onClick={() => {
                setChatbotMode(false);
                setSelectedUser(conv.user);
              }}
            >
              <div className="conversation-avatar">
                {conv.user.profileImage ? (
                  <img src={conv.user.profileImage} alt={conv.user.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(conv.user.name)}
                  </div>
                )}
                {conv.user.isOnline && <span className="online-indicator"></span>}
              </div>
              <div className="conversation-info">
                <h4>{conv.user.name}</h4>
                <p>{conv.lastMessage.content}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="unread-badge">{conv.unreadCount}</span>
              )}
            </div>
          ))}

          {conversations.length === 0 && !chatbotMode && (
            <div className="empty-conversations">
              <p>No conversations yet</p>
              <p>Search for users to start chatting!</p>
            </div>
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {selectedUser.profileImage ? (
                    <img src={selectedUser.profileImage} alt={selectedUser.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {chatbotMode ? '🤖' : getInitials(selectedUser.name)}
                    </div>
                  )}
                </div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  {!chatbotMode && (
                    <span className="user-status">
                      {selectedUser.isOnline ? 'Online' : 'Offline'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.sender._id === user._id || !message.sender._id ? 'sent' : 'received'} ${message.isBot ? 'bot' : ''}`}
                >
                  {message.sender._id !== user._id && !message.isBot && (
                    <div className="message-avatar">
                      {message.sender.profileImage ? (
                        <img src={message.sender.profileImage} alt={message.sender.name} />
                      ) : (
                        <div className="avatar-placeholder-sm">
                          {getInitials(message.sender.name)}
                        </div>
                      )}
                    </div>
                  )}
                  {message.isBot && (
                    <div className="message-avatar">
                      <div className="avatar-placeholder-sm">🤖</div>
                    </div>
                  )}
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="message-time">
                      {timeAgo(message.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && !chatbotMode && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
              />
              <button type="submit" className="btn btn-primary">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
