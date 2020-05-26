export default {
  dev: {
    '/api/': {
      target: 'http://api.blog.test',
      changeOrigin: true,
    },
  },
};
