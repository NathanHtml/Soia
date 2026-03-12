(() => {
  const userConfig = window.NAI_CONFIG || {};
  const apiConfig = {
    baseUrl: userConfig.API_BASE || '',
    path: userConfig.PATH || '/chat',
    method: 'POST',
    headers: userConfig.HEADERS || { 'Content-Type': 'application/json' },
    buildBody: (message, ctx) => ({ message, history: ctx.history }),
    parseReply: (data) =>
      data?.reply ||
      data?.response ||
      data?.message ||
      data?.choices?.[0]?.message?.content ||
      (typeof data === 'string' ? data : JSON.stringify(data))
  };

  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatLog = document.getElementById('chat-log');
  const state = { history: [] };

  function appendMessage(role, text, options = {}) {
    const msg = document.createElement('div');
    msg.className = `msg ${role}`;
    if (options.id) msg.dataset.id = options.id;

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = role;

    const body = document.createElement('p');
    body.textContent = text;

    msg.appendChild(label);
    msg.appendChild(body);
    chatLog.appendChild(msg);
    chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' });
    return msg;
  }

  function setTyping(show) {
    const existing = chatLog.querySelector('.msg.typing');
    if (show) {
      if (!existing) appendMessage('ai', 'SOIA is thinking...', { id: 'typing' }).classList.add('typing');
    } else if (existing) {
      existing.remove();
    }
  }

  async function sendToApi(message) {
    const endpoint = `${apiConfig.baseUrl}${apiConfig.path}`;
    const payload = apiConfig.buildBody(message, { history: state.history.slice(-6) });
    const res = await fetch(endpoint, {
      method: apiConfig.method,
      headers: apiConfig.headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('request failed');

    let data;
    try {
      data = await res.json();
    } catch (_) {
      data = await res.text();
    }
    return apiConfig.parseReply(data);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    if (!apiConfig.baseUrl) {
      appendMessage('ai', 'Something went wrong. Please try again.');
      return;
    }

    chatInput.value = '';
    appendMessage('user', message);
    state.history.push({ role: 'user', content: message });

    setTyping(true);
    chatInput.disabled = true;

    try {
      const reply = await sendToApi(message);
      setTyping(false);
      appendMessage('ai', reply);
      state.history.push({ role: 'assistant', content: reply });
    } catch (err) {
      setTyping(false);
      appendMessage('ai', 'Something went wrong. Please try again.');
    } finally {
      chatInput.disabled = false;
      chatInput.focus();
    }
  }

  chatForm.addEventListener('submit', handleSubmit);
})();
