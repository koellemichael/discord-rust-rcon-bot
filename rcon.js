/* eslint-disable no-console */
import WebSocket from 'ws';
import { EventEmitter } from 'events';

export default class Rcon extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.socket = null;
    this.reconnectAttempt = 0;
    this.reconnectTimeoutId = undefined;
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(`ws://${this.config.rconHost}:${this.config.rconPort}/${this.config.rconPassword}`);
    this.registerEvents();
  }

  reconnect() {
    console.log(`Trying to reconnect to RCON Server "${this.config.rconHost}:${this.config.rconPort}"...`);
    this.connect();
    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnect();
      this.reconnectAttempt += 1;
    }, 5000 * (this.reconnectAttempt + 1));
  }

  registerEvents() {
    this.socket.on('open', () => {
      if (this.reconnectTimeoutId !== undefined) {
        clearTimeout(this.reconnectTimeoutId);
        this.reconnectTimeoutId = undefined;
        this.reconnectAttempt = 0;
      }
      console.log(`Connection with RCON Server "${this.config.rconHost}:${this.config.rconPort}" established!`);
    });

    this.socket.on('error', (e) => {
      console.log(`RCON Server Error: ${e}`);
    });

    this.socket.on('close', () => {
      console.log('Connection to RCON Server was closed!');
      this.reconnect();
    });

    this.socket.on('message', (event) => {
      const packet = JSON.parse(event);
      if (packet.Type !== 'Chat') return;
      const messagePacket = JSON.parse(packet.Message);
      this.emit('chat-message', messagePacket);
    });
  }

  serverResponse(id) {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Server response timed out'));
      }, 5000);
    });

    const response = new Promise((resolve) => {
      // eslint-disable-next-line consistent-return
      const responseCallback = (packet) => {
        const res = JSON.parse(packet);
        if (res.Identifier === id) {
          this.socket.removeEventListener('message', responseCallback);
          return resolve(res.Message);
        } if (res.Identifier === -1 && res.Type !== 'Chat') {
          console.log(res);
        }
      };

      this.socket.on('message', responseCallback);
    });

    return Promise.race([response, timeout]);
  }

  async sendCommand(command) {
    const id = Math.floor(Math.random() * (2 ** 31 - 1));
    const packet = JSON.stringify({
      Identifier: id,
      Message: command,
      Type: 2,
    });

    this.socket.send(packet);
    return this.serverResponse(id);
  }

  async sendMessage(message) {
    return this.sendCommand(`say ${message.content}`);
  }
}
