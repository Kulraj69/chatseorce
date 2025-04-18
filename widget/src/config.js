/**
 * Configuration file for the RAG Chat Widget
 * Edit this file to customize the widget behavior and appearance
 */

const config = {
  // API Settings
  api: {
    baseUrl: 'http://127.0.0.1:8000',
    endpoints: {
      query: '/query',
      health: '/health'
    },
    timeout: 30000 // milliseconds
  },
  
  // Widget Settings
  widget: {
    title: 'RAG Assistant',
    placeholderText: 'Ask about your documents...',
    emptyStateMessage: 'I can answer questions about your uploaded documents!',
    errorMessage: 'Sorry, I had trouble processing your request.',
    position: 'bottom-left', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    initiallyOpen: false
  },
  
  // Theme Settings
  theme: {
    primaryColor: '#2e7d32', // Green theme
    primaryDarkColor: '#1b5e20',
    textLight: '#ffffff',
    textDark: '#212529',
    bgLight: '#ffffff',
    bgDark: '#343a40',
    userBubbleColor: '#e8f5e9',
    assistantBubbleColor: '#2e7d32'
  }
};

export default config; 