module.exports = {
  apps: [
    {
      name: 'dannyshoes-api',
      cwd: '/root/dannyshoes/apps/api',
      script: 'dist/main.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'dannyshoes-web',
      cwd: '/root/dannyshoes/apps/web',
      script: 'node_modules/.bin/next',
      args: 'start -p 8000',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
    },
  ],
};
