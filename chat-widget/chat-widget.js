/*
 * Chat Widget – standalone bundle
 * Requires a <div id="chat-widget-root"></div> on the host page.
 * Connects to FastAPI endpoint http://127.0.0.1:8000/query
 */
(function () {
    const API_URL = 'http://127.0.0.1:8000/query';
  
    /* ───────────────────────── Styles */
    const style = document.createElement('style');
    style.textContent = `
      .cw-bubble{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;cursor:pointer;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,.25);transition:background .2s}
      .cw-bubble:hover{background:#2563eb}
      .cw-window{position:fixed;bottom:96px;right:24px;width:320px;max-height:420px;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden;z-index:999;opacity:0;transform:translateY(20px);pointer-events:none;transition:opacity .25s,transform .25s}
      .cw-window.open{opacity:1;transform:translateY(0);pointer-events:all}
      .cw-header{background:#3b82f6;padding:12px 16px;color:#fff;font-weight:600;display:flex;justify-content:space-between;align-items:center}
      .cw-close{cursor:pointer;font-size:18px}
      .cw-messages{flex:1;overflow-y:auto;padding:16px 12px;font-size:14px}
      .cw-msg{max-width:80%;margin-bottom:10px;padding:8px 10px;border-radius:8px;line-height:1.3;word-wrap:break-word}
      .cw-msg.user{background:#3b82f6;color:#fff;margin-left:auto}
      .cw-msg.bot{background:#f1f5f9;color:#111827}
      .cw-input{display:flex;border-top:1px solid #e5e7eb}
      .cw-input input{flex:1;border:none;padding:10px 12px;font-size:14px;outline:none}
      .cw-input button{background:#3b82f6;color:#fff;border:none;padding:0 18px;cursor:pointer;transition:background .2s}
      .cw-input button:hover{background:#2563eb}`;
    document.head.appendChild(style);
  
    /* ───────────────────────── DOM */
    const root = document.getElementById('chat-widget-root') || document.body;
    const bubble = document.createElement('div');
    const windowEl = document.createElement('div');
  
    bubble.className = 'cw-bubble';
    bubble.innerHTML = '💬';
  
    windowEl.className = 'cw-window';
    windowEl.innerHTML = `
      <div class="cw-header">Chatbot <span class="cw-close">✕</span></div>
      <div class="cw-messages" id="cwMessages"></div>
      <div class="cw-input">
        <input id="cwInput" type="text" placeholder="Type a message…" autocomplete="off" />
        <button id="cwSend">Send</button>
      </div>`;
  
    root.appendChild(bubble);
    root.appendChild(windowEl);
  
    const messagesEl = windowEl.querySelector('#cwMessages');
    const inputEl = windowEl.querySelector('#cwInput');
  
    /* ───────────────────────── Helpers */
    function appendMessage(role, text) {
      const div = document.createElement('div');
      div.className = 'cw-msg ' + (role === 'user' ? 'user' : 'bot');
      div.textContent = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div; // for later update
    }
  
    function toggleWindow(open) {
      if (open === undefined) open = !windowEl.classList.contains('open');
      windowEl.classList.toggle('open', open);
      if (open) inputEl.focus();
    }
  
    async function send() {
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      appendMessage('user', text);
      const botDiv = appendMessage('bot', '…');
  
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text }),
        });
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        botDiv.textContent = data.answer || '(no answer)';
      } catch (err) {
        botDiv.textContent = 'Error: ' + err.message;
      }
    }
  
    /* ───────────────────────── Events */
    bubble.addEventListener('click', () => toggleWindow());
    windowEl.querySelector('.cw-close').addEventListener('click', () => toggleWindow(false));
    windowEl.querySelector('#cwSend').addEventListener('click', send);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') send();
    });
  })();
  