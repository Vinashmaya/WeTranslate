import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Unique ID to prevent conflicts with the host page
const ROOT_ID = 'crm-polyglot-root';

let rootElement = document.getElementById(ROOT_ID);

if (!rootElement) {
  rootElement = document.createElement('div');
  rootElement.id = ROOT_ID;
  // Ensure the root itself doesn't block interaction with the page behind it
  // The App component will handle pointer-events for the widget
  rootElement.style.position = 'fixed';
  rootElement.style.top = '0';
  rootElement.style.left = '0';
  rootElement.style.width = '0';
  rootElement.style.height = '0';
  rootElement.style.zIndex = '999999';
  document.body.appendChild(rootElement);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);