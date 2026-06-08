let selectedFile = null;
let activeChatId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Mobile sidebar toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');

  menuToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });

  // New chat button
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

  // Chat form submit
  const chatForm = document.getElementById('chat-form');
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

    try {
      const res = await fetch('/chat', { method: 'POST', body: formData });
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

  // Load existing chats on page load
  await loadChats();
});

async function loadChats() {
  try {
    const res = await fetch('/api/chats');
    const data = await res.json();
    renderChatList(data.chats, data.active_chat_id);
    if (data.active_chat_id) activeChatId = data.active_chat_id;
  } catch {
    // Silently fail — server may not be ready
  }
}

function renderChatList(chats, currentActiveId) {
  const list = document.getElementById('chat-list');
  list.innerHTML = '';

  if (chats.length === 0) {
    list.innerHTML = '<p class="no-chats">No chats yet. Start one above.</p>';
    return;
  }

  // Most recent first
  [...chats].reverse().forEach((chat) => {
    const item = document.createElement('div');
    item.className = 'chat-item' + (chat.id === currentActiveId ? ' active' : '');
    item.dataset.id = chat.id;

    const title = document.createElement('span');
    title.className = 'chat-item-title';
    title.textContent = chat.title;
    title.addEventListener('click', () => switchChat(chat.id));

    const del = document.createElement('button');
    del.className = 'delete-chat-btn';
    del.title = 'Delete chat';
    del.textContent = '✕';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteChat(chat.id);
    });

    item.appendChild(title);
    item.appendChild(del);
    list.appendChild(item);
  });
}

async function createNewChat() {
  const res = await fetch('/api/chats', { method: 'POST' });
  const data = await res.json();
  activeChatId = data.chat_id;
  clearChatArea();
  await loadChats();
}

async function switchChat(chatId) {
  try {
    const res = await fetch(`/api/chats/${chatId}/switch`, { method: 'POST' });
    const data = await res.json();
    activeChatId = chatId;

    const chatArea = document.getElementById('chat-area');
    chatArea.innerHTML = '';

    if (!data.messages || data.messages.length === 0) {
      clearChatArea();
    } else {
      data.messages.forEach((msg) => {
        addMessage(msg.role === 'user' ? 'user' : 'bot', msg.content);
      });
    }

    await loadChats();

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('mobile-overlay').classList.remove('active');
  } catch {
    addMessage('bot', 'Error: Could not load chat.');
  }
}

async function deleteChat(chatId) {
  const res = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
  const data = await res.json();

  if (data.active_chat_id) {
    await switchChat(data.active_chat_id);
  } else {
    activeChatId = null;
    clearChatArea();
    await loadChats();
  }
}

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
    if (text) html += `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
    el.innerHTML = html;
  } else {
    el.innerHTML = renderMarkdown(text || '');
  }

  chatArea.appendChild(el);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function showTypingIndicator() {
  const chatArea = document.getElementById('chat-area');
  const el = document.createElement('div');
  el.classList.add('message', 'bot-message', 'typing-wrapper');
  el.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
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
  // Escape HTML first to prevent XSS, then apply markdown transforms
  let html = escapeHtml(text);

  // Fenced code blocks
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // Unordered list items
  html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  // Paragraphs (double newline → paragraph break)
  html = html.replace(/\n\n/g, '</p><p>');
  // Single newlines
  html = html.replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}
