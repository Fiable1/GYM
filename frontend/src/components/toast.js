import { useEffect } from 'react';

export const toast = {
  success: (msg) => show(msg, 'success'),
  error: (msg) => show(msg, 'error'),
  info: (msg) => show(msg, 'info'),
};

let toasts = [];

function show(msg, type) {
  toasts.forEach((t) => document.body.removeChild(t.el));
  toasts = [];
  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    animation: toastIn 0.3s ease;
    max-width: 360px;
  `;
  const bg = type === 'success' ? '#00d68f' : type === 'error' ? '#ff3d71' : '#0095ff';
  el.style.background = bg;
  el.textContent = msg;
  document.body.appendChild(el);
  toasts.push({ el });

  const style = document.createElement('style');
  style.textContent = '@keyframes toastIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
  document.head.appendChild(style);

  setTimeout(() => {
    el.style.transition = 'all 0.4s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (el.parentNode) document.body.removeChild(el);
      toasts = toasts.filter((t) => t.el !== el);
    }, 400);
  }, 3500);
}