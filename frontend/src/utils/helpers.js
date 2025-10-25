export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatDate(date)} at ${formatTime(date)}`;
};

export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';

  return 'Just now';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getLevelColor = (level) => {
  switch (level) {
    case 'Beginner':
      return '#10B981';
    case 'Intermediate':
      return '#F59E0B';
    case 'Expert':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#F59E0B';
    case 'accepted':
      return '#10B981';
    case 'rejected':
      return '#EF4444';
    case 'completed':
      return '#6366F1';
    case 'cancelled':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};

export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\d\s\-+()]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

let toastTimeout = null;
export const showToast = (message, type = 'info') => {
  // Remove any existing toasts to prevent stacking
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(t => t.remove());
  
  // Clear any pending timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 20px;">
        ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  toastTimeout = setTimeout(() => {
    toast.remove();
    toastTimeout = null;
  }, 3000);
};

export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

export const downloadJSON = (data, filename) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
