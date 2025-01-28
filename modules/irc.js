const tls = require('tls');
const { fishDecrypt } = require('./fish');
const { sendCommand } = require('./utils');
const { getDiskUsage, formatDiskUsage } = require('./df');
const config = require('../config.json');

// Function to get the blowfish key for a given channel
const getBlowfishKeyForChannel = (channel) => {
  const channelConfig = config.server.channels.find((ch) => ch.name === channel);
  return channelConfig ? channelConfig.blowfishKey : null;
};

// Start the IRC bot
const startBot = () => {
  const { host, port, ssl, nickname, connectstring, channels } = config.server;

  const options = {
    host,
    port,
    rejectUnauthorized: false, // Allow self-signed certificates
  };

  const socket = ssl ? tls.connect(options) : require('net').connect(options);

  socket.setEncoding('utf8');

  socket.on('connect', () => {
    console.log(`[INFO] Connecting to IRC server at ${host}:${port}`);
    sendCommand(socket, `PASS ${connectstring}`);
    sendCommand(socket, `NICK ${nickname}`);
    sendCommand(socket, `USER ${nickname} 0 * :StatsBot`);

    // Dynamically join all channels
    channels.forEach(({ name }) => {
      console.log(`[INFO] Joining channel: ${name}`);
      sendCommand(socket, `JOIN ${name}`);
    });

    console.log('[INFO] All channels joined.');
  });

  socket.on('data', async (data) => {
    //console.debug(`[DEBUG] Received data: ${data.trim()}`);
    if (data.startsWith('PING :')) {
      sendCommand(socket, `PONG :${data.substring(6)}`);
      return;
    }

    const lines = data.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || !trimmedLine.includes('PRIVMSG')) continue;

      const match = trimmedLine.match(/^:(\S+?)!\S+ PRIVMSG (\S+) :(.+)$/);
      if (!match) continue;

      const [_, sender, channel, message] = match;

      const blowfishKey = getBlowfishKeyForChannel(channel);
      if (!blowfishKey) {
        console.error(`[ERROR] Blowfish key is undefined for channel: ${channel}`);
        continue;
      }

      let decryptedMessage;
      try {
        if (message.startsWith('+OK ')) {
          decryptedMessage = fishDecrypt(message, blowfishKey);
          if (!decryptedMessage) {
            //console.error('[ERROR] Blowfish decryption returned null or empty string.');
            continue;
          }
        } else {
          decryptedMessage = message; // Not encrypted
        }
      } catch (err) {
        console.error(`[ERROR] Blowfish decryption failed for ${channel}:`, err.message);
        continue;
      }

      //console.debug(`[DEBUG] Decrypted message from ${channel}: ${decryptedMessage}`);

      // Handle "!df" command
	if (decryptedMessage.trim() === '!df') {
  		console.log(`[INFO] !df command received in ${channel}`);
  	try {
    		const results = await getDiskUsage(config.disks);
    		const formattedResults = formatDiskUsage(results);

    		formattedResults.forEach((line) =>
      		sendCommand(socket, `PRIVMSG ${channel} :${line}`, blowfishKey)
    		);
  		} catch (err) {
    	console.error(`[ERROR] Failed to process !df command in ${channel}:`, err.message);
  		}
	}


    }
  });

  socket.on('error', (err) => {
    console.error(`[ERROR] Socket error: ${err.message}`);
  });

  socket.on('close', () => {
    console.log('[INFO] Connection closed.');
  });

  return socket;
};

module.exports = { startBot };
