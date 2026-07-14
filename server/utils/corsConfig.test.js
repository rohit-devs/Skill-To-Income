const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllowedOrigins } = require('./corsConfig');

test('includes localhost and 127.0.0.1 when no client url is provided', () => {
  const origins = getAllowedOrigins({ CLIENT_URL: undefined, CLIENT_URLS: undefined });
  assert.deepEqual(origins, ['http://localhost:3000', 'http://127.0.0.1:3000']);
});

test('parses comma-separated client urls and preserves explicit values', () => {
  const origins = getAllowedOrigins({ CLIENT_URLS: 'http://localhost:3000, https://app.example.com' });
  assert.deepEqual(origins, ['http://localhost:3000', 'https://app.example.com', 'http://127.0.0.1:3000']);
});
