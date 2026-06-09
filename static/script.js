// ── Model suggestions per provider ──────────────────────────────────────────
const MODEL_SUGGESTIONS = {
  gemini: [
    'gemini-2.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ],
  openrouter: [
    'google/gemini-2.5-flash',
    'meta-llama/llama-3.3-70b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'openai/gpt-4o-mini',
  ],
};

// ── State ────────────────────────────────────────────────────────────────────
let selectedFile  = null;
let activeChatId  = null;

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // Mobile sidebar
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('mobile-overlay').classList.toggle('active');
  });
  document.getElementById('mobile-overlay')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('mobile-overlay').classList.remove('active');
  });

  // New chat
  document.getElementById('new-chat-btn').addEventListener('click', createNewChat);

  // File attach
  const fileInput = document.getElementById('file-input');
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      selectedFile = file;
      document.getElementById('file-name').textContent = file.name;
      document.getElementById('file-preview').classList.add('visible');
    }
  });
  document.getElementById('remove-file').addEventListener('click', clearFile);

  // Chat form
  const chatForm     = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');

  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = `${messageInput.scrollHeight}px`;
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.requestSubmit();
    }
  });

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text && !selectedFile) return;

    addMessage('user', text, selectedFile?.name);
    const sentFile = selectedFile;
    messageInput.value = '';
    messageInput.style.height = 'auto';
    clearFile();
    showTypingIndicator();

    const formData = new FormData();
    formData.append('message', text);
    if (sentFile) formData.append('file', sentFile);

    // Build headers with user-supplied key if set
    const headers = buildApiHeaders();

    try {
      const res  = await fetch('/chat', { method: 'POST', headers, body: formData });
      const data = await res.json();
      removeTypingIndicator();

      if (data.response) {
        addMessage('bot', data.response);
        activeChatId = data.chat_id;
        await loadChats();
      } else {
        addMessage('bot', 'Error: ' + (data.error || 'Unknown error.'));
      }
    } catch {
      removeTypingIndicator();
      addMessage('bot', 'System Error: Could not reach the server.');
    }
  });

  // Settings modal
  initSettingsModal();

  // Load existing chats
  await loadChats();
});

// ── API header builder ───────────────────────────────────────────────────────
function buildApiHeaders() {
  const key      = localStorage.getItem('userApiKey')      || '';
  const provider = localStorage.getItem('userProvider')    || 'gemini';
  const model    = localStorage.getItem('userModel')       || 'gemini-2.5-flash';
  const headers  = {};
  if (key) {
    headers['X-User-Api-Key']  = key;
    headers['X-User-Provider'] = provider;
    headers['X-User-Model']    = model;
  }
  return headers;
}

// ── Settings modal ───────────────────────────────────────────────────────────
function initSettingsModal() {
  const overlay  = document.getElementById('settings-overlay');
  const btn      = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('settings-close');
  const saveBtn  = document.getElementById('settings-save');
  const clearBtn = document.getElementById('settings-clear');
  const provSel  = document.getElementById('setting-provider');

  btn.addEventListener('click', openSettings);
  closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });

  provSel.addEventListener('change', updateModelSuggestions);

  saveBtn.addEventListener('click', () => {
    const key      = document.getElementById('setting-apikey').value.trim();
    const provider = provSel.value;
    const model    = document.getElementById('setting-model').value.trim() || MODEL_SUGGESTIONS[provider]?.[0] || 'gemini-2.5-flash';

    if (key) {
      localStorage.setItem('userApiKey', key);
      localStorage.setItem('userProvider', provider);
      localStorage.setItem('userModel', model);
    } else {
      // If key is blank, clear everything → fall back to server default
      localStorage.removeItem('userApiKey');
      localStorage.setItem('userProvider', provider);
      localStorage.setItem('userModel', model);
    }

    overlay.classList.remove('active');
    updateSettingsBadge();
  });

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem('userApiKey');
    localStorage.removeItem('userProvider');
    localStorage.removeItem('userModel');
    overlay.classList.remove('active');
    updateSettingsBadge();
  });

  updateSettingsBadge();
}

function openSettings() {
  const overlay  = document.getElementById('settings-overlay');
  const provSel  = document.getElementById('setting-provider');
  const modelIn  = document.getElementById('setting-model');
  const keyIn    = document.getElementById('setting-apikey');
  const note     = document.getElementById('active-key-note');

  const savedKey      = localStorage.getItem('userApiKey')   || '';
  const savedProvider = localStorage.getItem('userProvider') || 'gemini';
  const savedModel    = localStorage.getItem('userModel')    || '';

  provSel.value  = savedProvider;
  modelIn.value  = savedModel;
  keyIn.value    = '';  // never pre-fill the key field for security
  keyIn.placeholder = savedKey ? '(key saved — enter new key to replace)' : 'Leave blank to use the server default key';

  note.textContent = savedKey
    ? `Active: custom ${savedProvider} key — model: ${savedModel || MODEL_SUGGESTIONS[savedProvider]?.[0]}`
    : 'Active: server default key (Gemini 2.5 Flash)';

  updateModelSuggestions();
  overlay.classList.add('active');
}

function updateModelSuggestions() {
  const provider     = document.getElementById('setting-provider').value;
  const container    = document.getElementById('model-suggestions');
  const suggestions  = MODEL_SUGGESTIONS[provider] || [];
  container.innerHTML = suggestions
    .map(m => `<button type="button" class="suggestion-chip" data-model="${m}">${m}</button>`)
    .join('');
  container.querySelectorAll('.suggestion-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('setting-model').value = btn.dataset.model;
    });
  });
}

function updateSettingsBadge() {
  const btn = document.getElementById('settings-btn');
  const key = localStorage.getItem('userApiKey');
  btn.classList.toggle('active', !!key);
  btn.title = key
    ? `Settings (custom key: ${localStorage.getItem('userProvider')})`
    : 'Settings';
}

// ── Chat list ────────────────────────────────────────────────────────────────
async function loadChats() {
  try {
    const res  = await fetch('/api/chats');
    const data = await res.json();
    renderChatList(data.chats, data.active_chat_id);
    if (data.active_chat_id) activeChatId = data.active_chat_id;
  } catch { /* server not ready */ }
}

function renderChatList(chats, currentActiveId) {
  const list = document.getElementById('chat-list');
  list.innerHTML = '';

  if (chats.length === 0) {
    list.innerHTML = '<p class="no-chats">No chats yet. Start one above.</p>';
    return;
  }

  [...chats].reverse().forEach((chat) => {
    const item  = document.createElement('div');
    item.className = 'chat-item' + (chat.id === currentActiveId ? ' active' : '');
    item.dataset.id = chat.id;

    const title = document.createElement('span');
    title.className   = 'chat-item-title';
    title.textContent = chat.title;
    title.addEventListener('click', () => switchChat(chat.id));

    const del = document.createElement('button');
    del.className   = 'delete-chat-btn';
    del.title       = 'Delete chat';
    del.textContent = '✕';
    del.addEventListener('click', (e) => { e.stopPropagation(); deleteChat(chat.id); });

    item.appendChild(title);
    item.appendChild(del);
    list.appendChild(item);
  });
}

async function createNewChat() {
  const res  = await fetch('/api/chats', { method: 'POST' });
  const data = await res.json();
  if (data.error) { alert(data.error); return; }
  activeChatId = data.chat_id;
  clearChatArea();
  await loadChats();
}

async function switchChat(chatId) {
  try {
    const res  = await fetch(`/api/chats/${chatId}/switch`, { method: 'POST' });
    const data = await res.json();
    activeChatId = chatId;

    document.getElementById('chat-area').innerHTML = '';
    if (!data.messages || data.messages.length === 0) {
      clearChatArea();
    } else {
      data.messages.forEach(msg => addMessage(msg.role === 'user' ? 'user' : 'bot', msg.content));
    }

    await loadChats();
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('mobile-overlay').classList.remove('active');
  } catch { addMessage('bot', 'Error: Could not load chat.'); }
}

async function deleteChat(chatId) {
  const res  = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
  const data = await res.json();
  if (data.active_chat_id) {
    await switchChat(data.active_chat_id);
  } else {
    activeChatId = null;
    clearChatArea();
    await loadChats();
  }
}

// ── UI helpers ───────────────────────────────────────────────────────────────
function clearChatArea() {
  document.getElementById('chat-area').innerHTML =
    '<div class="message bot-message"><p>Hello! I\'m ClementGPT. How can I help you today?</p></div>';
}

function addMessage(sender, text, fileName) {
  removeTypingIndicator();
  const chatArea = document.getElementById('chat-area');
  const el = document.createElement('div');
  el.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');

  if (sender === 'user') {
    let html = '';
    if (fileName) html += `<div class="file-badge">&#x1f4ce; ${escapeHtml(fileName)}</div>`;
    if (text)     html += `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
    el.innerHTML = html;
  } else {
    el.innerHTML = renderMarkdown(text || '');
  }

  chatArea.appendChild(el);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function showTypingIndicator() {
  const el = document.createElement('div');
  el.classList.add('message', 'bot-message', 'typing-wrapper');
  el.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  const chatArea = document.getElementById('chat-area');
  chatArea.appendChild(el);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function removeTypingIndicator() {
  document.querySelector('.typing-wrapper')?.remove();
}

function clearFile() {
  selectedFile = null;
  document.getElementById('file-input').value = '';
  document.getElementById('file-preview').classList.remove('visible');
  document.getElementById('file-name').textContent = '';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,   '<h1>$1</h1>');
  html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  return `<p>${html}</p>`;
}
