import { create } from 'zustand';
import config from './config';

// Welcome message from the assistant
const welcomeMessage = {
  role: 'assistant',
  text: config.widget.emptyStateMessage || 'Ask me anything about the documents...'
};

const useStore = create((set) => ({
  // States
  open: false,
  messages: [welcomeMessage], // Start with a welcome message
  
  // Actions
  setOpen: (isOpen) => set({ open: isOpen }),
  toggleOpen: () => set((state) => ({ open: !state.open })),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  clear: () => set({ messages: [welcomeMessage] }), // Reset to welcome message
}));

export default useStore; 