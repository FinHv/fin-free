const { startBot } = require('./modules/irc');
const config = require('./config.json');

(async () => {
  console.log(`[INFO] Starting IRC bot with nickname: ${config.server.nickname}`);
  
  try {
    const bot = startBot();
    
    bot.on('close', () => {
      console.log('[INFO] IRC connection closed.');
    });

    bot.on('error', (err) => {
      console.error('[ERROR] IRC encountered an error:', err.message);
    });

    console.log('[INFO] IRC bot is running...');
  } catch (error) {
    console.error('[ERROR] Failed to start IRC bot:', error.message);
  }
})();
