import React from 'https://cdn.skypack.dev/react';
import ReactDOMClient from 'https://cdn.skypack.dev/react-dom/client';
import App from './App.js';

const { createRoot } = ReactDOMClient;

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
