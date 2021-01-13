
# Discord Rust Rcon Bot
This is a self hosted discord rcon bot that lets you execute commands from discord and live view the game chat. It also displays the current player count in the bots activity. 
## Installation 
Basic installation steps:
 1. Create a discord bot [(here)](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
 2. Install node and npm
 3. Clone git repository 
 4. Copy and customize config.yml file 
 5. Start the bot

### Linux
This was tested on a Ubuntu Server 20.04 LXC container. 
Before you start, create a discord bot [(here)](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)

Ensure you have the latest updates

    apt update && apt upgrade -y

Install Node.js and NPM

    apt install nodejs
    apt install npm
Install Git

    apt install git

Clone the git repository

    git clone https://github.com/koellemichael/discord-rust-rcon-bot.git

#### Configure the bot:

    cp config-example.yml config.yml && nano config.yml

#### Run the bot continuously
If you want the bot to restart after a crash or server restart follow these steps:
Install PM2

    apt install pm2

Make sure that PM2 runs after a reboot

    pm2 startup

start the bot 

    pm2 start --name "discord-rcon-rust-bot" npm -- start
You can alternatively use forever or native systemd.

#### Run the bot normally (not recommended)
If you just want to start the bot normally, use:
(Note: skip this if you followed the PM2 setup)

    npm start
## Configuration
For the bot to run correctly you need to configure the gamesever itself aswell as the bot. 
### Server Configuration
Ensure you have rcon web enabled. (Normally it is enabled on default)

In the gameserver config you need to specify:

    rcon.web 1
### Bot Configuration
The  configuration file must be named config.yml and placed in the root of the repository directory. 
   

     token:  "bot token goes here"
     chatChannelId:  "channel id for the live chat"
     commandChannelId:  "channel id for command execution"
     rconHost:  "gameserver ip or domain"
     rconPort:  "28016"
     rconPassword:  "your rcon password"
     adminRole:  "admin role id"

[How to create a bot and get the bot token](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)

[How to get a role id](https://www.reddit.com/r/discordapp/comments/5bezg2/role_id/)

Messages to chatChannel of users with adminRole are directly forwarded to the server.

## Troubleshooting
Run the bot normally to see the logs:

    npm start
If you use PM2 have to stop the bot first:

    pm2 stop discord-rcon-rust-bot
You can also monitor the process with pm2 (this displays only current logs)

    pm2 monit

The error log should usually give you a hint on what is wrong.
You probably forgot to copy the example config file. 