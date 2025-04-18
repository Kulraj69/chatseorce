import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import useStore from '../store';
import api from '../api';
import config from '../config';
import '../styles.css';

function ChatWindow() {
  const { open, messages, addMessage } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isApiHealthy, setIsApiHealthy] = useState(true);

  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      const isHealthy = await api.checkHealth();
      setIsApiHealthy(isHealthy);
    };
    
    checkApiHealth();
  }, []);
  
  // Emit event when the widget opens or closes
  useEffect(() => {
    if (open) {
      window.dispatchEvent(new CustomEvent('ragWidgetOpen'));
    } else {
      window.dispatchEvent(new CustomEvent('ragWidgetClose'));
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user', text: input.trim() };
    addMessage(userMessage);
    setInput('');
    
    // Emit message sent event
    window.dispatchEvent(new CustomEvent('ragWidgetMessageSent', { 
      detail: { message: userMessage.text }
    }));
    
    // Show loading state
    setLoading(true);
    
    try {
      // Call the API
      const answer = await api.queryRag(userMessage.text);
      
      // Add assistant message with the answer
      addMessage({ role: 'assistant', text: answer });
      
      // Emit response received event
      window.dispatchEvent(new CustomEvent('ragWidgetResponseReceived', { 
        detail: { response: answer }
      }));
    } catch (error) {
      // Handle error by showing an error message
      const errorMessage = error.message || config.widget.errorMessage;
      
      addMessage({ 
        role: 'assistant', 
        text: errorMessage
      });
      
      // Emit error event
      window.dispatchEvent(new CustomEvent('ragWidgetError', { 
        detail: { error: errorMessage }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`cw-window ${open ? '' : 'cw-hidden'}`}>
      <div className="cw-header">
        <div className="cw-title">{config.widget.title}</div>
      </div>
      
      {!isApiHealthy && (
        <div className="cw-api-warning">
          API connection issue. The chat may not work correctly.
        </div>
      )}
      
      <MessageList 
        messages={messages} 
        emptyStateMessage={config.widget.emptyStateMessage} 
      />
      
      <form className="cw-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          className="cw-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={config.widget.placeholderText}
          disabled={loading || !isApiHealthy}
        />
        <button 
          type="submit" 
          className="cw-send-btn"
          disabled={loading || !input.trim() || !isApiHealthy}
        >
          {loading ? (
            // Loading spinner
            <svg className="cw-spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="16" />
            </svg>
          ) : (
            // Send icon
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

export default ChatWindow; 