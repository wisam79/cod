const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'خطأ في تسجيل الدخول');
  }
  return res.json();
}

export async function loginWithGoogle() {
  throw new Error('تسجيل الدخول بجوجل غير مدعوم في النسخة الحالية بسبب الترقية للخادم المحلي');
}

export async function registerUser(name, email, password, role) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'خطأ في التسجيل');
  }
  return res.json();
}

export async function logoutUser() {
  return Promise.resolve();
}

export function onAuthChange(callback) {
  const token = localStorage.getItem('auth_token');
  if (token) {
    fetch(`${API_URL}/auth/me`, { headers: getHeaders() })
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (user) {
          callback({ uid: user.id, getIdToken: async () => token, ...user });
        } else {
          callback(null);
        }
      })
      .catch(() => callback(null));
  } else {
    setTimeout(() => callback(null), 100);
  }
  return () => {}; 
}

export async function fetchMembers() {
  const res = await fetch(`${API_URL}/members`, { headers: getHeaders() });
  if (!res.ok) throw new Error('فشل جلب الأعضاء');
  return res.json();
}

export async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks`, { headers: getHeaders() });
  if (!res.ok) throw new Error('فشل جلب المهام');
  return res.json();
}

export async function addTask(taskData) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('فشل إضافة المهمة');
  return res.json();
}

export async function updateTask(taskId, updates) {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('فشل تحديث المهمة');
  return res.json();
}

export async function deleteTask(taskId) {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('فشل حذف المهمة');
}

export async function addComment(taskId, text, authorId) {
  const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('فشل إضافة التعليق');
  return res.json();
}

export async function fetchMessages(page = 1, limit = 50) {
  const res = await fetch(`${API_URL}/messages?page=${page}&limit=${limit}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('فشل جلب الرسائل');
  return res.json();
}

export async function addMessage(text, senderId) {
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('فشل إرسال الرسالة');
  return res.json();
}

export async function fetchNotifications(page = 1, limit = 50) {
  const res = await fetch(`${API_URL}/notifications?page=${page}&limit=${limit}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('فشل جلب الإشعارات');
  return res.json();
}

export async function clearNotifications(userId) {
  const res = await fetch(`${API_URL}/notifications`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('فشل مسح الإشعارات');
}

// WebSocket logic
let ws = null;
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

function startPollingFallback() {
  if (pollingTimer) return;
  
  // Fetch initial IDs
  fetchMessages(1, 1).then(msgs => {
    if (msgs && msgs.length > 0) lastMsgId = msgs[0].id;
  }).catch(() => {});
  
  fetchNotifications(1, 1).then(notifs => {
    if (notifs && notifs.length > 0) lastNotifId = notifs[0].id;
  }).catch(() => {});

  pollingTimer = setInterval(async () => {
    // Only poll if tab is active and WebSocket is NOT open
    if (document.hidden) return;
    if (ws && ws.readyState === WebSocket.OPEN) return;
    
    try {
      // Poll new messages
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
      
      // Poll new tasks (triggers a refetch of all tasks to maintain order)
      if (taskSubscribers.length > 0) {
        taskSubscribers.forEach(cb => cb({ type: 'task_updated' }));
      }

      // Poll new notifications
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
      console.warn('Polling fallback warning:', e);
    }
  }, 6000); // Check every 6 seconds
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
    setTimeout(connectWS, 5000);
  };
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

export function onNotificationsChange(userId, callback) {
  notificationSubscribers.push(callback);
  connectWS();
  return () => { notificationSubscribers = notificationSubscribers.filter(cb => cb !== callback); };
}
