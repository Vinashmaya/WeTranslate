import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const ROOT_ID = 'crm-polyglot-root';

// 1. Inject Global Styles for the Widget (Scrollbars, etc)
// Since we are injecting into foreign pages, we must ensure our internal styles work
const styleElement = document.createElement('style');
styleElement.innerHTML = `
  #${ROOT_ID} ::-webkit-scrollbar {
    width: 6px;
  }
  #${ROOT_ID} ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  #${ROOT_ID} ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  #${ROOT_ID} ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;
document.head.appendChild(styleElement);

// 2. Mount the Container
let rootElement = document.getElementById(ROOT_ID);

if (!rootElement) {
  rootElement = document.createElement('div');
  rootElement.id = ROOT_ID;
  
  // Container base styles - ensure it sits on top but doesn't block clicks when transparent
  rootElement.style.position = 'fixed';
  rootElement.style.top = '0';
  rootElement.style.left = '0';
  rootElement.style.width = '0px';
  rootElement.style.height = '0px';
  rootElement.style.zIndex = '2147483647'; // Max Z-Index
  rootElement.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif'; // Reset font
  
  document.body.appendChild(rootElement);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);