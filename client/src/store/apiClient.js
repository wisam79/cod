const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
};

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return handleResponse(res);
}

export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(res);
}

export async function resetPassword(token, password) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });
  return handleResponse(res);
}

export async function updateProfile(profileData) {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profileData)
  });
  return handleResponse(res);
}

export async function changePassword(passwordData) {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(passwordData)
  });
  return handleResponse(res);
}

export async function logoutUser() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch {
      // ignore
    }
  }
  // Clean up WebSocket and polling
  disconnectWS();
}

export function onAuthChange(callback) {
  const token = localStorage.getItem('auth_token');
  if (token) {
    fetch(`${API_URL}/auth/me`, { headers: getHeaders() })
      .then(res => {
        if (res.ok) {
          return res.json().then(user => {
            const member = user?.member || user;
            callback({ uid: member.id, getIdToken: async () => token, ...member });
          });
        } else if (res.status === 401 || res.status === 403) {
          callback(null, { status: res.status });
        } else {
          callback(null, { keepToken: true, error: res.status });
        }
      })
      .catch((err) => {
        callback(null, { keepToken: true, error: err.message });
      });
  } else {
    setTimeout(() => callback(null), 100);
  }
  return () => {};
}

export async function fetchMembers() {
  const res = await fetch(`${API_URL}/members`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function addTask(taskData) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(taskData)
  });
  return handleResponse(res);
}

export async function updateTask(taskId, updates) {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse(res);
}

export async function deleteTask(taskId) {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'فشل حذف المهمة' }));
    throw new Error(error.error || 'فشل حذف المهمة');
  }
}

export async function addComment(taskId, text) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text })
  });
  return handleResponse(res);
}

export async function fetchMessages(page = 1, limit = 50) {
  const res = await fetch(`${API_URL}/messages?page=${page}&limit=${limit}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function addMessage(text) {
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text })
  });
  return handleResponse(res);
}

export async function fetchNotifications(page = 1, limit = 50) {
  const res = await fetch(`${API_URL}/notifications?page=${page}&limit=${limit}`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function clearNotifications() {
  const res = await fetch(`${API_URL}/notifications`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('فشل مسح الإشعارات');
}

// Admin API calls
export async function fetchAdminMembers() {
  const res = await fetch(`${API_URL}/admin/members`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function createAdminMember(memberData) {
  const res = await fetch(`${API_URL}/admin/members`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(memberData)
  });
  return handleResponse(res);
}

export async function updateAdminMember(id, memberData) {
  const res = await fetch(`${API_URL}/admin/members/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(memberData)
  });
  return handleResponse(res);
}

export async function deleteAdminMember(id) {
  const res = await fetch(`${API_URL}/admin/members/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res);
}

export async function fetchAdminSettings() {
  const res = await fetch(`${API_URL}/admin/settings`, { headers: getHeaders() });
  return handleResponse(res);
}

export async function updateAdminSettings(settings) {
  const res = await fetch(`${API_URL}/admin/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(settings)
  });
  return handleResponse(res);
}

// WebSocket layer
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000;
let taskSubscribers = [];
let messageSubscribers = [];
let notificationSubscribers = [];
let wsStatusSubscribers = [];

export function notifyWsStatus(status) {
  wsStatusSubscribers.forEach(cb => cb(status));
}

export function onWsStatusChange(cb) {
  wsStatusSubscribers.push(cb);
  return () => { wsStatusSubscribers = wsStatusSubscribers.filter(fn => fn !== cb); };
}

let pollingTimer = null;
let lastMsgId = 0;
let lastNotifId = 0;

function fetchLatestIds() {
  fetchMessages(1, 1).then(msgs => {
    if (msgs && msgs.length > 0) lastMsgId = msgs[0].id;
  }).catch(() => {});
  fetchNotifications(1, 1).then(notifs => {
    if (notifs && notifs.length > 0) lastNotifId = notifs[0].id;
  }).catch(() => {});
}

function startPollingFallback() {
  if (pollingTimer) return;
  fetchLatestIds();
  pollingTimer = setInterval(async () => {
    if (document.hidden) return;
    if (ws && ws.readyState === WebSocket.OPEN) return;
    try {
      if (messageSubscribers.length > 0) {
        const msgs = await fetchMessages(1, 20);
        if (msgs && msgs.length > 0) {
          const sorted = [...msgs].sort((a, b) => a.id - b.id);
          sorted.forEach(msg => {
            if (msg.id > lastMsgId) {
              lastMsgId = msg.id;
              messageSubscribers.forEach(cb => cb(msg));
            }
          });
        }
      }
      if (taskSubscribers.length > 0) {
        taskSubscribers.forEach(cb => cb({ type: 'task_updated' }));
      }
      if (notificationSubscribers.length > 0) {
        const notifs = await fetchNotifications(1, 20);
        if (notifs && notifs.length > 0) {
          const sorted = [...notifs].sort((a, b) => a.id - b.id);
          sorted.forEach(notif => {
            if (notif.id > lastNotifId) {
              lastNotifId = notif.id;
              notificationSubscribers.forEach(cb => cb(notif));
            }
          });
        }
      }
    } catch (e) {
      // Polling error silently ignored
    }
  }, 6000);
}

function stopPollingFallback() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

function getBackoffDelay() {
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
  const jitter = Math.random() * 1000;
  return delay + jitter;
}

function clearAllSubscribers() {
  taskSubscribers = [];
  messageSubscribers = [];
  notificationSubscribers = [];
  wsStatusSubscribers = [];
  stopPollingFallback();
}

function connectWS() {
  startPollingFallback();
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return;
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  notifyWsStatus('connecting');
  const wsUrl = import.meta.env.VITE_WS_URL || (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host;
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'auth', token }));
    notifyWsStatus('connected');
    reconnectAttempts = 0;
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'message_created') {
      messageSubscribers.forEach(cb => cb(data.payload));
    } else if (['task_created', 'task_updated', 'task_deleted', 'comment_added'].includes(data.type)) {
      taskSubscribers.forEach(cb => cb(data));
    } else if (data.type === 'notification_created') {
      notificationSubscribers.forEach(cb => cb(data.payload));
    }
  };

  ws.onclose = () => {
    notifyWsStatus('disconnected');
    const delay = getBackoffDelay();
    reconnectAttempts++;
    setTimeout(connectWS, delay);
  };
}

export function disconnectWS() {
  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
  reconnectAttempts = 0;
  lastMsgId = 0;
  lastNotifId = 0;
  notifyWsStatus('disconnected');
  clearAllSubscribers();
}

export function onTasksChange(callback) {
  taskSubscribers.push(callback);
  connectWS();
  return () => { taskSubscribers = taskSubscribers.filter(cb => cb !== callback); };
}

export function onMessagesChange(callback) {
  messageSubscribers.push(callback);
  connectWS();
  return () => { messageSubscribers = messageSubscribers.filter(cb => cb !== callback); };
}

export function onNotificationsChange(callback) {
  notificationSubscribers.push(callback);
  connectWS();
  return () => { notificationSubscribers = notificationSubscribers.filter(cb => cb !== callback); };
}