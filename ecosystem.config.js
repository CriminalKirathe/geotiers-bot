// PM2 Ecosystem Configuration File
// This file helps PM2 manage your bot process

module.exports = {
    apps: [{
        name: 'geotiers-bot',
        script: 'bun',
        args: 'run start',
        cwd: '/root/geotiers-bot',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        env: {
            NODE_ENV: 'production'
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }]
};
