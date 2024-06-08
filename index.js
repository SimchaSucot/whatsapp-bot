import venom from "venom-bot";
import express from "express";
import fs from "fs";
import { fileURLToPath } from 'url';
import path from 'path';
import puppeteer from 'puppeteer';
import weatherHandler from "./components/weather.js";
import statusHandler from "./components/status.js";
import profilePictureHandler from './components/profilePictureHandler.js';
import youtubeHandler from './components/youtubeHandler.js';
import shulchanAruchHandler from "./components/shulchanAruchHandler.js";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

const SESSION_PATH = "./whatsapp-session/tokens";
const QR_CODE_PATH = './public/qr_code.png';

if (!fs.existsSync(SESSION_PATH)) {
  fs.mkdirSync(SESSION_PATH, { recursive: true });
}

let userState = {};
let botConnected = false;

async function createBot() {
  try {
    if (fs.existsSync(SESSION_PATH)) {
      fs.rmSync(SESSION_PATH, { recursive: true, force: true });
    }

    // Install Chrome if not available
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });
    const browserWSEndpoint = browser.wsEndpoint();
    await browser.close();

    const client = await venom.create(
      'whatsapp-bot',
      (base64Qr, asciiQR) => {
        console.log(asciiQR); // Optional to log the QR in the terminal

        var matches = base64Qr.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
          response = {};

        if (matches.length !== 3) {
          throw new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = Buffer.from(matches[2], 'base64');

        var imageBuffer = response;

        if (!fs.existsSync('./public')) {
          fs.mkdirSync('./public', { recursive: true });
        }

        fs.writeFileSync(QR_CODE_PATH, imageBuffer.data, 'binary', function (err) {
          if (err != null) {
            console.log(err);
          }
        });
      },
      undefined,
      {
        multidevice: true,
        headless: 'new', // Use new headless mode
        browserArgs: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
        folderNameToken: "tokens",
        mkdirFolderToken: SESSION_PATH,
        puppeteerOptions: {
          browserWSEndpoint: browserWSEndpoint, // Use the existing browser instance
        },
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await client.page.waitForFunction('window.WAPI !== undefined');

    botConnected = true;

    // Delete QR code after connection
    if (fs.existsSync(QR_CODE_PATH)) {
      fs.unlinkSync(QR_CODE_PATH);
    }

    start(client);
    console.log("The chat is connected");
  } catch (error) {
    console.error("Error creating bot:", error);
    setTimeout(createBot, 5000); // Retry after 5 seconds
  }
}

createBot();

function start(client) {
  client.onMessage(async (message) => {
    try {
      if (message && message.body && typeof message.body.trim === 'function') {
        const text = message.body.trim().toLowerCase();
        const from = message.from;
        const type = message.type;

        console.log("Message received:", message);

        if (message.type === "location") {
          console.log(message.lat, message.lng);
          await weatherHandler(client, message);
        } else if (text.startsWith('http') && (text.includes('youtube.com') || text.includes('youtu.be'))) {
          await youtubeHandler(client, message);
        } else {
          const name = message.notifyName || message.pushname || "חבר ללא שם";
          console.log(text);
          console.log(from, ":", name, "{", type, "}");
          if (text === "מזג האוויר" || text === "מזג אוויר" || text === "מה המזג האוויר?") {
            await weatherHandler(client, message);
          } else if (text === "מה קורה" || text === "מה נשמע" || text === "מה איתך") {
            await statusHandler(client, message);
          } else if (text === "תמונת פרופיל") {
            await profilePictureHandler(client, message);
          } else if (text === "שולחן ערוך" || userState[from]) {
            await shulchanAruchHandler(client, message ,userState);
          }
        }
      } else {
        console.error('Error: message is undefined or not a string.');
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  app.post("/send-message", async (req, res) => {
    const { message, to } = req.body;
    try {
      await client.sendText(to, message);
      res.send({ status: "Message sent" });
    } catch (error) {
      console.error("Error in send-message API:", error);
      res.status(500).send({ status: "Error", message: error.message });
    }
  });
}

app.get("/", (req, res) => {
  if (botConnected) {
    res.send("<p>The bot is currently connected.</p>");
  } else {
    res.send(`
      <p>Please scan the QR code to connect:</p>
      <img src="/qr_code.png" alt="QR Code">
    `);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
