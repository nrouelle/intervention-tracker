module.exports = {
  apps: [{
    name: 'intervention-tracker-backend',
    script: './server.js',
    cwd: '/var/www/intervention-tracker/backend',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3011,
      JWT_SECRET: 'CHANGEZ_MOI_EN_PRODUCTION'  // À modifier via variable d'environnement
    },
    error_file: '/var/log/pm2/intervention-tracker-error.log',
    out_file: '/var/log/pm2/intervention-tracker-out.log',
    log_file: '/var/log/pm2/intervention-tracker-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000
  }]
};
