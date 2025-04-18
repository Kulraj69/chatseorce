import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import config from './config';

// Apply external configuration if available
if (window.RAG_WIDGET_CONFIG) {
  // Deep merge the external config with the default config
  Object.keys(window.RAG_WIDGET_CONFIG).forEach(section => {
    if (config[section] && typeof config[section] === 'object') {
      config[section] = {
        ...config[section],
        ...window.RAG_WIDGET_CONFIG[section]
      };
    } else {
      config[section] = window.RAG_WIDGET_CONFIG[section];
    }
  });
  
  console.log('RAG Widget: External configuration applied');
}

// Expose API for external use
window.openRagWidget = function() {
  const useStore = require('./store').default;
  useStore.getState().setOpen(true);
};

// Function to initialize the widget
function initChatWidget() {
  // Check if the root element exists
  let rootElement = document.getElementById('chat-widget-root');
  
  // If not, create it
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = 'chat-widget-root';
    document.body.appendChild(rootElement);
  }
  
  // Render the widget
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Dispatch loaded event
  window.dispatchEvent(new CustomEvent('ragWidgetLoaded'));
}

// Initialize the widget when the DOM is fully loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initChatWidget();
} else {
  document.addEventListener('DOMContentLoaded', initChatWidget);
}

// Also export the init function for manual initialization
window.initChatWidget = initChatWidget;
