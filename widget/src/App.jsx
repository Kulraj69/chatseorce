import React, { useEffect } from 'react';
import ChatBubble from './components/ChatBubble';
import ChatWindow from './components/ChatWindow';
import { applyTheme, setWidgetPosition } from './utils/themeLoader';
import config from './config';
import './styles.css';

function App() {
  // Apply theme and position on mount
  useEffect(() => {
    applyTheme();
    setWidgetPosition();
    
    // Open widget initially if configured
    if (config.widget.initiallyOpen) {
      // Import here to avoid circular dependencies
      const useStore = require('./store').default;
      useStore.getState().setOpen(true);
    }
  }, []);

  return (
    <div className="cw-container">
      <ChatWindow />
      <ChatBubble />
    </div>
  );
}

export default App;
