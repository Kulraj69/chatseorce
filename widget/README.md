# RAG Chat Widget

A floating chat widget that can be embedded in any website to provide RAG (Retrieval Augmented Generation) capabilities, similar to Intercom or Crisp chat widgets.

## Overview

This widget connects to a FastAPI backend with Azure OpenAI and AstraDB to provide AI-powered chat functionality based on your documents. The widget is built with React and compiled into a single JavaScript file for easy embedding.

## Features

- Floating chat bubble in the bottom-right corner
- Expandable chat window
- Message history with user and AI messages
- Automatic scrolling to new messages
- Error handling for API failures
- Dark/light mode support
- Fully responsive
- Single file deployment

## Usage

### Embedding the Widget

Add the following code to any HTML page where you want the chat widget to appear:

```html
<!-- Option 1: Basic Embedding -->
<div id="chat-widget-root"></div>
<script src="https://yourdomain.com/path/to/chat-widget.js" defer></script>

<!-- Option 2: One-line Embedding (no root div needed) -->
<script src="https://yourdomain.com/path/to/chat-widget.js" defer></script>

<!-- Option 3: Self-hosted Local Embedding -->
<div id="chat-widget-root"></div>
<script src="./dist/chat-widget.js" defer></script>
```

#### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website with RAG Chat</title>
  <style>
    /* Your website styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
    }
  </style>
</head>
<body>
  <h1>Welcome to My Website</h1>
  <p>This page includes an AI-powered RAG chat widget.</p>
  
  <!-- Your website content -->
  
  <!-- Chat Widget Root Element (optional - will be created automatically if missing) -->
  <div id="chat-widget-root"></div>
  
  <!-- Chat Widget Script -->
  <script src="./dist/chat-widget.js" defer></script>
</body>
</html>
```

### API Configuration

By default, the widget connects to `http://127.0.0.1:8000/query`. To change this endpoint, modify the `API_BASE_URL` in `src/api.js` before building the widget:

```javascript
// in src/api.js
const API_BASE_URL = 'https://api.yourdomain.com';
```

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Building for Production

Build the single-file widget:

```
npm run build
```

The output file will be in `dist/index.html`. Copy this file to `dist/chat-widget.js` for deployment:

```
cp dist/index.html dist/chat-widget.js
```

### Testing

To test the widget locally:

1. Build the widget: `npm run build`
2. Copy the output file: `cp dist/index.html dist/chat-widget.js`
3. Start a local server: `python3 -m http.server 8080`
4. Open `http://localhost:8080/test.html` in your browser

## Customization

### Styling

All CSS classes are prefixed with `cw-` to avoid conflicts with existing styles. You can modify the appearance by editing `src/styles.css`.

### State Management

The widget uses Zustand for state management. You can modify the store behavior in `src/store.js`.

## License

MIT
