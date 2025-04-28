const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://idea-backend.onrender.com', // 🔥 твій бекенд
      changeOrigin: true,
      secure: false,
    })
  );
};
