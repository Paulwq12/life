// Base by DGXeon
// re-upload? recode? copy code? give credit ya :)
// YouTube: @DGXeon
// Instagram: unicorn_xeon13
// Telegram: t.me/xeonbotinc
// GitHub: @DGXeon
// WhatsApp: +916909137213
// Want more free bot scripts? subscribe to my YouTube channel: https://youtube.com/@DGXeon

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

function start() {
   let args = [path.join(__dirname, 'main.js'), ...process.argv.slice(2)];
   console.log([process.argv[0], ...args].join('\n'));
   let p = spawn(process.argv[0], args, {
         stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      })
      .on('message', data => {
         if (data == 'reset') {
            console.log('Restarting Bot...');
            p.kill();
            start();
            delete p;
         }
      })
      .on('exit', code => {
         console.error('Exited with code:', code);
         if (code == '.' || code == 1 || code == 0) start();
      });
}

// Start the bot
start();

// Start an HTTP server to indicate the bot is live
const PORT = process.env.PORT || 3091; // Use the platform-defined PORT or default to 3000
http.createServer((req, res) => {
   res.writeHead(200, { 'Content-Type': 'text/html' });
   res.end('<h1>The bot is live!</h1><p>Your bot is running successfully.</p>');
}).listen(PORT, () => {
   console.log(`HTTP server is live at http://localhost:${PORT}`);
});
