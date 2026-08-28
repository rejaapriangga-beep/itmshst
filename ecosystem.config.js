module.exports = {
  apps: [
    {
      name: 'itms',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/itms',
      env: {
        PORT: 3003,
        NODE_ENV: 'production',
      },
    },
  ],
}
