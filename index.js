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
const puppeteer = require('puppeteer');

// Function to start Puppeteer and disguise it
async function startBrowser() {
   const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
   });
   const page = await browser.newPage();

   // Disguise Puppeteer as a regular browser
   await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
   );
   await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
   });

   // Add additional disguises
   await page.evaluateOnNewDocument(() => {
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
   });

   console.log('Browser started and disguised.');
   return { browser, page };
}

// Function to start the bot
async function start(page) {
   let args = [path.join(__dirname, 'main.js'), ...process.argv.slice(2)];
   console.log([process.argv[0], ...args].join('\n'));
   let p = spawn(process.argv[0], args, {
         stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      })
      .on('message', async (data) => {
         if (data === 'reset') {
            console.log('Restarting Bot...');
            p.kill();
            await page.close(); // Close the Puppeteer page
            start(await startBrowser().then(b => b.page)); // Restart with a new disguised browser
         }
      })
      .on('exit', async (code) => {
         console.error('Exited with code:', code);
         if (code === '.' || code === 1 || code === 0) {
            await page.close();
            start(await startBrowser().then(b => b.page)); // Restart on exit
         }
      });
}

// Main function to initialize Puppeteer and start the bot
(async () => {
   const { page } = await startBrowser();
   start(page); // Start the bot with Puppeteer integration
})();

// Start an HTTP server to indicate the bot is live
const PORT = process.env.PORT || 3091; // Use the platform-defined PORT or default to 3000
http.createServer((req, res) => {
   res.writeHead(200, { 'Content-Type': 'text/html' });
   res.end('<h1>The bot is live!</h1><p>Your bot is running successfully.</p>');
}).listen(PORT, () => {
   console.log(`HTTP server is live at http://localhost:${PORT}`);
});
