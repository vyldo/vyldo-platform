// Custom Vite plugin to disable host check for tunnels
export default function disableHostCheck() {
  return {
    name: 'disable-host-check',
    configureServer(server) {
      // Disable host check middleware
      server.middlewares.use((req, res, next) => {
        // Allow all hosts
        req.headers.host = 'localhost:5173';
        next();
      });
    },
  };
}
