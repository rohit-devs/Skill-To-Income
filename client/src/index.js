// ----------------------------------------------------------------------
// File: client/src/index.js
// Purpose: Main entry point for the React client application.
// Author: Principal Software Architect
// Dependencies: react, react-dom, App.js, styles/generated-tailwind.css
// Used By: Browser
// Features: React 18 root rendering, StrictMode enabled.
// Responsibilities: Mount the top-level App component into the HTML DOM.
// ----------------------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/generated-tailwind.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

