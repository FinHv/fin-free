const { fishEncrypt, fishDecrypt } = require('./fish');

/**
 * Sends a command to the specified socket, with optional Blowfish encryption.
 * @param {Socket} socket - The socket connection to send the command to.
 * @param {string} cmd - The command to send.
 * @param {string} [blowfishKey=null] - Optional Blowfish encryption key.
 */
const sendCommand = (socket, cmd, blowfishKey = null) => {
  try {
    // Validate inputs
    if (!socket) {
      throw new Error('Invalid socket connection.');
    }
    if (typeof cmd !== 'string' || !cmd.trim()) {
      throw new Error('Invalid cmd: Command must be a non-empty string.');
    }
    if (blowfishKey) {
      if (typeof blowfishKey !== 'string') {
        throw new Error('Invalid blowfishKey: Must be a string.');
      }
      if (blowfishKey.length < 4 || blowfishKey.length > 56) {
        throw new Error('Invalid blowfishKey: Must be 4-56 characters long.');
      }
    }

    let messageToSend = cmd;

    // Encrypt if blowfishKey is provided
    if (blowfishKey && cmd.startsWith('PRIVMSG')) {
      if (!cmd.includes(':')) {
        throw new Error('Invalid cmd format: Missing message body.');
      }
      const [prefix, message] = cmd.split(/:(.+)/);

      if (!message || !message.trim()) {
        throw new Error('Invalid cmd: Message body must not be empty.');
      }

      const encryptedMessage = fishEncrypt(message, blowfishKey);

      if (encryptedMessage) {
        messageToSend = `${prefix}:${encryptedMessage}`;
        //console.debug(`[DEBUG] Encrypted Message Sent: ${encryptedMessage}`);
      } else {
        throw new Error('Encryption failed. Unable to send message.');
      }
    }

    // Send the message
    const finalMessage = `${messageToSend}\r\n`;
    socket.write(finalMessage, 'utf8');
    //console.debug(`[SEND] ${messageToSend}`);
  } catch (error) {
    console.error(`[ERROR] Failed to send command: ${error.message}`);
  }
};


const colors = {
  red: '\x034',      // Red
  green: '\x033',    // Green
  purple: '\x036',   // Purple
  blue: '\x032',     // Blue
  bold: '\x02',      // Bold
  reset: '\x0F',     // Reset
  gray: '\x0314',    // Dark Gray
};

const formatText = (text, ...formats) => {
  return `${formats.join('')}${text}${colors.reset}`;
};



module.exports = {
  sendCommand,
  colors, 
  formatText
};
