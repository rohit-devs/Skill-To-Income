const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  use: {
    headless: true,
    browserName: 'chromium',
    launchOptions: {
      executablePath: 'C:\\Users\\rohit\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe'
    }
  }
});
