import React, { useRef, useEffect } from 'react';
import '../styles.css';

/**
 * MessageList component to display the conversation history
 * @param {{ 
 *   messages: Array<{role: string, text: string}>,
 *   emptyStateMessage: string 
 * }} props - Component props
 */
function MessageList({ messages, emptyStateMessage = 'Ask me anything about the documents...' }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="cw-message-list">
        <div className="cw-empty-state">
          {emptyStateMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="cw-message-list">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`cw-message cw-${message.role}`}
        >
          {message.text}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList; 