import venom from "venom-bot";
import express from "express";
import fs from "fs";
import weatherHandler from "./components/weather.js";
import statusHandler from "./components/status.js";
import profilePictureHandler from './components/profilePictureHandler.js';
import youtubeHandler from './components/youtubeHandler.js';

const app = express();
app.use(express.json());

const SESSION_PATH = "./whatsapp-session/tokens";

if (!fs.existsSync(SESSION_PATH)) {
  fs.mkdirSync(SESSION_PATH, { recursive: true });
}

async function createBot() {
  try {
    const client = await venom.create({
      session: "whatsapp-bot",
      multidevice: true,
      headless: true,
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
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await client.page.waitForFunction('window.WAPI !== undefined');

    start(client);
    console.log("The chat is connected");
  } catch (error) {
    console.error("Error creating bot:", error);
  }
}

createBot();

function start(client) {
  // client.sendText('status@broadcast', 'חיבור חדש!!!');
  client.onMessage(async (message) => {
    try {
      // בדיקה אם message מוגדר כראוי
      if (message && message.body && typeof message.body.trim === 'function') {
        const text = message.body.trim().toLowerCase();
        const from = message.from;
        const type = message.type;
        // await client.startTyping(from)

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
          if (text === "מזג האוויר") {
            await weatherHandler(client, message);
          } else if (text === "מה קורה") {
            await statusHandler(client, message);
          } else if (text === "תמונת פרופיל") {
            await profilePictureHandler(client, message);
          // } else {
          //   await client.sendText(message.from, 'לא הבנתי את הבקשה שלך.');
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
