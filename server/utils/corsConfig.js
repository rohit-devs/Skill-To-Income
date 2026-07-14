const getAllowedOrigins = (env = process.env) => {
  const configuredOrigins = [env.CLIENT_URL, ...(env.CLIENT_URLS || '').split(',').map((value) => value.trim()).filter(Boolean)]
    .filter(Boolean);

  // In production do not include localhost defaults — require explicit CLIENT_URL(s)
  const defaults = (env.NODE_ENV === 'production') ? [] : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  return Array.from(new Set([...configuredOrigins, ...defaults]));
};

module.exports = { getAllowedOrigins };
