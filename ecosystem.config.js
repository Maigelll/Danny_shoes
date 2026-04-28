module.exports = {
  apps: [
    {
      name: 'api',
      script: 'pnpm',
      args: 'run start --filter @dannyshoes/api',
      env: {
        NODE_ENV: 'production',
        API_PORT: 4000
      },
    },
    {
      name: 'web',
      script: 'pnpm',
      args: 'run start --filter @dannyshoes/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
    },
  ],
};
