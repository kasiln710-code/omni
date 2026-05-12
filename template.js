// ============================================================
//  OmniConnect – Shared Template (Header + Footer Injection)
//  All pages include this script. Set data-depth on <script>
//  tag to control relative path prefix.
// ============================================================

(function () {
  'use strict';

  const script = document.currentScript;
  const depth = parseInt(script.getAttribute('data-depth') || '0');
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  const isHome = (depth === 0 && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/rongxin_web/') || window.location.pathname === ''));

  // ── Navbar HTML ──
  const NAV_HTML = `
<nav class="navbar" id="navbar">
  <div class="container">
    <div class="nav-inner">
      <a href="${prefix}index.html" class="logo">
        <div class="logo-icon">🔗</div>
        <span class="logo-text">Omni<span>Connect</span></span>
      </a>
      <ul class="nav-links">
        <li><a href="${isHome ? '#products' : prefix + 'index.html#products'}" data-i18n="nav.products">产品</a></li>
        <li><a href="${isHome ? '#ai-agents' : prefix + 'index.html#ai-agents'}" data-i18n="nav.ai">AI 智能体</a></li>
        <li><a href="${isHome ? '#process' : prefix + 'index.html#process'}" data-i18n="nav.process">服务流程</a></li>
        <li><a href="${isHome ? '#industries' : prefix + 'index.html#industries'}" data-i18n="nav.industries">行业方案</a></li>
        <li><a href="${isHome ? '#pricing' : prefix + 'index.html#pricing'}" data-i18n="nav.pricing">定价</a></li>
      </ul>
      <div class="nav-right">
        <div class="lang-switcher">
          <button class="lang-btn" id="langBtn">
            <span id="langFlag">🇨🇳</span>
            <span id="langLabel">中文</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div class="lang-dropdown">
            <div class="lang-option active" onclick="switchLang('zh')"><span class="flag">🇨🇳</span> 中文 (简体)</div>
            <div class="lang-option" onclick="switchLang('en')"><span class="flag">🇺🇸</span> English</div>
            <div class="lang-option" onclick="switchLang('ar')"><span class="flag">🇸🇦</span> العربية</div>
          </div>
        </div>
        <a href="${isHome ? '#contact' : prefix + 'index.html#contact'}" class="btn-nav" data-i18n="nav.contact">免费咨询</a>
      </div>
      <div class="hamburger" id="hamburger" onclick="toggleMenu()">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
</nav>

<div class="mobile-menu" id="mobileMenu">
  <ul class="mobile-links">
    <li><a href="${isHome ? '#products' : prefix + 'index.html#products'}" onclick="toggleMenu()" data-i18n="nav.products">产品</a></li>
    <li><a href="${isHome ? '#ai-agents' : prefix + 'index.html#ai-agents'}" onclick="toggleMenu()" data-i18n="nav.ai">AI 智能体</a></li>
    <li><a href="${isHome ? '#process' : prefix + 'index.html#process'}" onclick="toggleMenu()" data-i18n="nav.process">服务流程</a></li>
    <li><a href="${isHome ? '#industries' : prefix + 'index.html#industries'}" onclick="toggleMenu()" data-i18n="nav.industries">行业方案</a></li>
    <li><a href="${isHome ? '#pricing' : prefix + 'index.html#pricing'}" onclick="toggleMenu()" data-i18n="nav.pricing">定价</a></li>
    <li><a href="${isHome ? '#contact' : prefix + 'index.html#contact'}" onclick="toggleMenu()" class="btn-nav" data-i18n="nav.contact">免费咨询</a></li>
  </ul>
</div>`;

  // ── Footer HTML ──
  const FOOTER_HTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="${prefix}index.html" class="logo"><div class="logo-icon">🔗</div><span class="logo-text">Omni<span>Connect</span></span></a>
        <p data-i18n="ft.desc">企业级融合通信服务商，连接全球，智慧沟通。</p>
        <div class="footer-social">
          <a class="social-btn" href="#">💼</a>
          <a class="social-btn" href="#">🐦</a>
          <a class="social-btn" href="#">💬</a>
          <a class="social-btn" href="#">📧</a>
        </div>
      </div>
      <div class="footer-col">
        <h5 data-i18n="ft.products">产品</h5>
        <ul class="footer-links">
          <li><a href="${prefix}pages/sms.html" data-i18n="p.sms.name">企业短信</a></li>
          <li><a href="${prefix}pages/whatsapp.html" data-i18n="p.wa.name">WhatsApp 商务</a></li>
          <li><a href="${prefix}pages/voice.html" data-i18n="p.voice.name">AI 语音机器人</a></li>
          <li><a href="${prefix}pages/email.html" data-i18n="p.email.name">邮件群发</a></li>
          <li><a href="${isHome ? '#products' : prefix + 'index.html#products'}" data-i18n="p.iot.name">物联网卡</a></li>
          <li><a href="${isHome ? '#products' : prefix + 'index.html#products'}" data-i18n="p.roam.name">国际漫游流量包</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5 data-i18n="ft.solutions">解决方案</h5>
        <ul class="footer-links">
          <li><a href="${prefix}pages/onboarding.html" data-i18n="ft.onboarding">开始接入</a></li>
          <li><a href="${prefix}pages/solutions.html" data-i18n="ft.solutions_page">获取方案</a></li>
          <li><a href="${prefix}pages/api.html" data-i18n="ft.api">API 文档</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5 data-i18n="ft.industries">行业方案</h5>
        <ul class="footer-links">
          <li><a href="${prefix}pages/industries/ecommerce.html" data-i18n="ind.ecom">跨境电商</a></li>
          <li><a href="${prefix}pages/industries/finance.html" data-i18n="ind.fin">国际金融</a></li>
          <li><a href="${prefix}pages/industries/saas.html" data-i18n="ind.saas">SaaS 软件</a></li>
          <li><a href="${prefix}pages/industries/social.html" data-i18n="ind.social">海外社交平台</a></li>
          <li><a href="${prefix}pages/industries/logistics.html" data-i18n="ind.logi">国际物流</a></li>
          <li><a href="${prefix}pages/industries/gaming.html" data-i18n="ind.game">游戏出海</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5 data-i18n="ft.company">公司</h5>
        <ul class="footer-links">
          <li><a href="#" data-i18n="ft.about">关于我们</a></li>
          <li><a href="#" data-i18n="ft.blog">博客</a></li>
          <li><a href="#" data-i18n="ft.careers">加入我们</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p data-i18n="ft.copy">© 2026 OmniConnect. All rights reserved.</p>
    </div>
  </div>
</footer>`;

  // ── Inject into DOM ──
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
  document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);

  // ── Language persistence ──
  const savedLang = localStorage.getItem('omni-lang') || 'zh';
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof switchLang === 'function') {
      switchLang(savedLang);
    }
  });

  // ── Override switchLang to persist ──
  const _origSwitchLang = window.switchLang;
  window.switchLang = function (lang) {
    localStorage.setItem('omni-lang', lang);
    if (typeof _origSwitchLang === 'function') _origSwitchLang(lang);
  };

})();
