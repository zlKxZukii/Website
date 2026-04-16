module.exports = {
  apps : [
    {
      name: 'minecraft-server',
      script: '/usr/bin/taskset',
      args: '-c 0,1,2,3 java -Xms8G -Xmx12G -jar paper.jar nogui',
      cwd: '/root/minecraft-server',
      interpreter: 'none',
      autorestart: true,
      watch: false
    },
    {
      name: 'scaletta',
      script: '/usr/bin/taskset',
      args: '-c 4-7 node src/app.js',
      cwd: '/root/twitch-bot',
      interpreter: 'none',
      autorestart: true
    }
  ]
};