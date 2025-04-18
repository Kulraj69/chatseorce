import config from '../config';

/**
 * Applies theme configuration from config.js to CSS variables
 */
export function applyTheme() {
  // Get the container element or create one
  let containerEl = document.querySelector('.cw-container');
  
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.className = 'cw-container';
    document.body.appendChild(containerEl);
  }
  
  // Add the theme-applied class
  containerEl.classList.add('cw-theme-applied');
  
  // Set CSS variables based on config
  containerEl.style.setProperty('--cw-theme-primary', config.theme.primaryColor);
  containerEl.style.setProperty('--cw-theme-primary-dark', config.theme.primaryDarkColor);
  containerEl.style.setProperty('--cw-theme-text-light', config.theme.textLight);
  containerEl.style.setProperty('--cw-theme-text-dark', config.theme.textDark);
  containerEl.style.setProperty('--cw-theme-bg-light', config.theme.bgLight);
  containerEl.style.setProperty('--cw-theme-bg-dark', config.theme.bgDark);
  containerEl.style.setProperty('--cw-theme-user-bubble', config.theme.userBubbleColor);
  containerEl.style.setProperty('--cw-theme-assistant-bubble', config.theme.assistantBubbleColor);
  
  console.log("Theme applied", config.theme);
  return containerEl;
}

/**
 * Sets the widget position based on config
 */
export function setWidgetPosition() {
  // Apply position to bubble
  const bubble = document.querySelector('.cw-bubble');
  const chatWindow = document.querySelector('.cw-window');
  
  if (!bubble || !chatWindow) {
    console.error("Cannot find bubble or chat window elements", { bubble, chatWindow });
    return;
  }
  
  const position = config.widget.position || 'bottom-right';
  console.log("Setting widget position to:", position);
  
  // Remove any previous positioning classes
  bubble.classList.remove('cw-top-left', 'cw-top-right', 'cw-bottom-left', 'cw-bottom-right');
  chatWindow.classList.remove('cw-top-left', 'cw-top-right', 'cw-bottom-left', 'cw-bottom-right');
  
  // Add the new position class
  bubble.classList.add(`cw-${position}`);
  chatWindow.classList.add(`cw-${position}`);
  
  // Force apply the position using inline styles for testing
  if (position === 'bottom-right') {
    bubble.style.bottom = '20px';
    bubble.style.right = '20px';
    bubble.style.left = 'auto';
    bubble.style.top = 'auto';
  } else if (position === 'bottom-left') {
    bubble.style.bottom = '20px';
    bubble.style.left = '20px';
    bubble.style.right = 'auto';
    bubble.style.top = 'auto';
  } else if (position === 'top-right') {
    bubble.style.top = '20px';
    bubble.style.right = '20px';
    bubble.style.left = 'auto';
    bubble.style.bottom = 'auto';
  } else if (position === 'top-left') {
    bubble.style.top = '20px';
    bubble.style.left = '20px';
    bubble.style.right = 'auto';
    bubble.style.bottom = 'auto';
  }
}

export default {
  applyTheme,
  setWidgetPosition
}; 