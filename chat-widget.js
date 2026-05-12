/**
 * 灵珠 💎 — B2B 智能体聊天挂件 (Vanilla JS)
 * 
 * 集成方式：在 index.html 的 </body> 前加入：
 *   <div id="lingzhu-root"></div>
 *   <script src="chat-widget.js"></script>
 */

(function() {
  'use strict';

  const CONFIG = {
    apiUrl: 'http://localhost:18789',     // OpenClaw Gateway
    agentId: 'lingzhu-b2b',
    title: '灵珠 💎',
    subtitle: 'AI 智能顾问',
    welcome: '👋 您好！我是灵珠，OmniConnect 的 AI 智能顾问。请问有什么可以帮助您的？',
    primaryColor: '#2563EB',
    secondaryColor: '#06B6D4'
  };

  // ── 样式注入 ──
  const style = document.createElement('style');
  style.textContent = `
    #lingzhu-root * { box-sizing: border-box; margin: 0; padding: 0; }
    #lingzhu-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    
    .lz-toggle {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${CONFIG.secondaryColor});
      color: #fff; border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(37,99,235,0.4);
      font-size: 24px; z-index: 99999;
      transition: transform 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .lz-toggle:hover { transform: scale(1.1); }
    .lz-toggle.open { transform: rotate(45deg); background: #ef4444; }

    .lz-widget {
      position: fixed; bottom: 92px; right: 24px;
      width: 380px; height: 580px; max-height: calc(100vh - 120px);
      background: #0f1729; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.4);
      display: none; flex-direction: column; z-index: 99998;
      overflow: hidden;
      animation: lzSlideUp 0.3s ease;
    }
    .lz-widget.open { display: flex; }
    @keyframes lzSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .lz-header {
      padding: 14px 18px;
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${CONFIG.secondaryColor});
      color: #fff; display: flex; align-items: center; gap: 10px;
      font-weight: 600; font-size: 15px; flex-shrink: 0;
    }
    .lz-header-close {
      margin-left: auto; background: none; border: none;
      color: #fff; cursor: pointer; opacity: 0.7; font-size: 18px;
    }
    .lz-header-close:hover { opacity: 1; }

    .lz-msgs {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .lz-msg {
      max-width: 85%; padding: 10px 14px; border-radius: 12px;
      font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;
    }
    .lz-msg.user {
      align-self: flex-end;
      background: ${CONFIG.primaryColor}; color: #fff;
      border-bottom-right-radius: 4px;
    }
    .lz-msg.bot {
      align-self: flex-start;
      background: rgba(255,255,255,0.08); color: #e0e0e0;
      border-bottom-left-radius: 4px;
    }
    .lz-msg.typing { animation: lzPulse 1.5s infinite; }
    @keyframes lzPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }

    .lz-input-area {
      padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08);
      display: flex; gap: 8px; background: #0a0f1a; flex-shrink: 0;
    }
    .lz-input {
      flex: 1; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px; background: rgba(255,255,255,0.05);
      color: #fff; font-size: 14px; outline: none; resize: none;
      font-family: inherit;
    }
    .lz-input:focus { border-color: ${CONFIG.primaryColor}; }
    .lz-input::placeholder { color: #666; }
    .lz-send {
      padding: 8px 18px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${CONFIG.secondaryColor});
      color: #fff; cursor: pointer; font-weight: 600; font-size: 14px;
    }
    .lz-send:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 480px) {
      .lz-widget {
        width: calc(100vw - 32px); right: 16px; bottom: 84px;
        height: calc(100vh - 120px);
      }
    }
  `;
  document.head.appendChild(style);

  // ── HTML ──
  const root = document.getElementById('lingzhu-root');
  if (!root) return;

  root.innerHTML = `
    <button class="lz-toggle" id="lzToggle" aria-label="打开聊天">💎</button>
    <div class="lz-widget" id="lzWidget">
      <div class="lz-header">
        <span>${CONFIG.title}</span>
        <small style="opacity:0.8;font-size:12px">${CONFIG.subtitle}</small>
        <button class="lz-header-close" id="lzClose">✕</button>
      </div>
      <div class="lz-msgs" id="lzMsgs"></div>
      <div class="lz-input-area">
        <textarea class="lz-input" id="lzInput" rows="1" placeholder="输入您的问题..."></textarea>
        <button class="lz-send" id="lzSend">发送</button>
      </div>
    </div>
  `;

  // ── 状态 ──
  let open = false;
  let loading = false;
  let sessionId = null;
  const messages = [{ role: 'bot', text: CONFIG.welcome }];

  // ── DOM 引用 ──
  const toggle = document.getElementById('lzToggle');
  const widget = document.getElementById('lzWidget');
  const close = document.getElementById('lzClose');
  const msgsEl = document.getElementById('lzMsgs');
  const input = document.getElementById('lzInput');
  const send = document.getElementById('lzSend');

  // ── 渲染消息 ──
  function render() {
    msgsEl.innerHTML = messages.map((m, i) => {
      const cls = m.role === 'user' ? 'user' : 'bot' + (m.typing ? ' typing' : '');
      return `<div class="lz-msg ${cls}">${m.text}</div>`;
    }).join('');
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  // ── 发送消息 ──
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || loading) return;

    messages.push({ role: 'user', text });
    messages.push({ role: 'bot', text: '思考中...', typing: true });
    input.value = '';
    loading = true;
    send.disabled = true;
    render();

    try {
      const res = await fetch(`${CONFIG.apiUrl}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: CONFIG.agentId,
          message: text,
          sessionId: sessionId || undefined
        })
      });
      const data = await res.json();
      if (data.sessionId) sessionId = data.sessionId;
      
      // 移除 typing indicator
      messages.pop();
      messages.push({ role: 'bot', text: data.reply || data.text || '抱歉，我现在无法回答，请稍后再试。' });
    } catch (err) {
      messages.pop();
      messages.push({ role: 'bot', text: '😓 连接出现问题了，请稍后再试。' });
    }

    loading = false;
    send.disabled = false;
    render();
  }

  // ── 事件绑定 ──
  toggle.addEventListener('click', () => {
    open = !open;
    toggle.classList.toggle('open', open);
    widget.classList.toggle('open', open);
    if (open) { input.focus(); render(); }
  });

  close.addEventListener('click', () => {
    open = false;
    toggle.classList.remove('open');
    widget.classList.remove('open');
  });

  send.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // 初始渲染
  render();
})();
