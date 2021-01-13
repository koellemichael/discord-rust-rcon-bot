/* eslint-disable no-console */
import { load, YAMLException } from 'js-yaml';
import { readFileSync } from 'fs';
import { Client } from 'discord.js';
import Rcon from './rcon';

let config;
try {
  config = load(readFileSync('config.yml', 'utf8'));
  console.log('Configuration config.yml was successfully loaded!');
} catch (e) {
  if (e instanceof YAMLException) {
    console.log('Error: YAML syntax of config.yml is incorrect. Please check and validate your syntax');
  } else {
    console.log('Error: config.yml file not found! Please make sure you created your own config.yml file. You can also copy and change the example file with "cp config-example.yml config.yml && nano config.yml". Also make sure that you have access permissions to the config file.');
  }
}

const discord = new Client();
const rcon = new Rcon(config);

setInterval(async () => {
  try {
    const info = JSON.parse(await rcon.sendCommand('serverinfo'));
    const queuedAndJoining = (info.Queued > 0 || info.Joining > 0) ? `(+${info.Joining + info.Queued})` : '';
    discord.user.setActivity(`Players: ${info.Players}${queuedAndJoining}/${info.MaxPlayers}`);
  } catch (e) {
    e.preventDefault();
  }
}, 30000);

rcon.on('chat-message', (msg) => {
  discord.channels.cache.get(config.chatChannelId).send(`**${msg.Username}**: ${msg.Message}`);
});

discord.on('ready', () => {
  console.log(`Connection with Discord "${discord.user.tag}" established!`);
});

discord.on('message', async (msg) => {
  // Discard messages from self
  if (msg.author.id === discord.user.id) {
    return;
  }

  if (msg.channel.id === config.chatChannelId
    && msg.member.roles.cache.find((r) => r.id === config.adminRole)) {
    try {
      process.stdout.write(`Executing command: ${msg.content}...\r`);
      await rcon.sendMessage(msg);
      process.stdout.write(`Executing command: ${msg.content}...ok\n`);
      msg.react('✅');
    } catch (error) {
      process.stdout.write(`Executing command: ${msg.content}...failed\r`);
      console.log(error);
      msg.react('❌');
    }
  }

  if (msg.channel.id === config.commandChannelId) {
    try {
      process.stdout.write(`Executing command: ${msg.content}...\r`);
      const res = await rcon.sendCommand(msg.content);
      msg.react('✅');
      if (String(res).length > 0) {
        process.stdout.write(`Executing command: ${msg.content}...${res}\n`);
        msg.reply(`\`\`\`✅ ${res}\`\`\``);
      } else {
        process.stdout.write(`Executing command: ${msg.content}...ok\n`);
      }
    } catch (error) {
      process.stdout.write(`Executing command: ${msg.content}...failed\r`);
      console.log(error);
      msg.react('❌');
      msg.reply(`\`\`\`❌ ${error.message}\`\`\``);
    }
  }

  if (msg.content === 'ping') {
    msg.reply('pong1');
  }
});

discord.login(config.token);
