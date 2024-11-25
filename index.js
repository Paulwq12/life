const puppeteer = require('puppeteer');
const path = require('path');
const { spawn } = require('child_process');

// Function to ensure Puppeteer dependencies are installed
async function installPuppeteerDependencies() {
   try {
      console.log('Ensuring Puppeteer dependencies are installed...');
      require('child_process').execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
      console.log('Puppeteer browser installed successfully.');
   } catch (error) {
      console.error('Error installing Puppeteer dependencies:', error.message);
      process.exit(1);
   }
}

// Function to get the correct Chrome executable path
async function getChromePath() {
   const puppeteerCachePath = path.resolve('/opt/render/.cache/puppeteer');
   const chromePath = path.join(
      puppeteerCachePath,
      'chrome',
      'linux-131.0.6778.85',
      'chrome-linux64',
      'chrome'
   );
   return chromePath;
}

// Function to start Puppeteer
async function startBrowser(chromePath) {
   try {
      console.log(`Launching Puppeteer with Chrome binary at: ${chromePath}`);
      const browser = await puppeteer.launch({
         args: ['--no-sandbox', '--disable-setuid-sandbox'],
         headless: true,
         executablePath: chromePath
      });

      const page = await browser.newPage();
      console.log('Puppeteer launched successfully.');

      // Disguise Puppeteer as a regular browser
      await page.setUserAgent(
         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      );
      await page.evaluateOnNewDocument(() => {
         Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });

      return { browser, page };
   } catch (error) {
      console.error('Failed to launch Puppeteer:', error.message);
      process.exit(1);
   }
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
            const chromePath = await getChromePath(); // Get the latest Chrome path
            start(await startBrowser(chromePath).then(b => b.page)); // Restart with a new disguised browser
         }
      })
      .on('exit', async (code) => {
         console.error('Exited with code:', code);
         if (code === '.' || code === 1 || code === 0) {
            await page.close();
            const chromePath = await getChromePath(); // Get the latest Chrome path
            start(await startBrowser(chromePath).then(b => b.page)); // Restart on exit
         }
      });
}

// Main function to initialize Puppeteer and start the bot
(async () => {
   await installPuppeteerDependencies(); // Ensure Puppeteer dependencies are installed
   const chromePath = await getChromePath(); // Get Chrome executable path
   const { page } = await startBrowser(chromePath); // Launch Puppeteer and get page instance
   start(page); // Start the bot with Puppeteer integration
})();
// Start an HTTP server to indicate the bot is live
const PORT = process.env.PORT || 3091; // Use the platform-defined PORT or default to 3091
http.createServer((req, res) => {
   res.writeHead(200, { 'Content-Type': 'text/html' });
   res.end('<h1>The bot is live!</h1><p>Your bot is running successfully.</p>');
}).listen(PORT, () => {
   console.log(`HTTP server is live at http://localhost:${PORT}`);
});
