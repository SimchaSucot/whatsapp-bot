import venom from 'venom-bot';
import express from 'express';
import fs from 'fs';
import weatherHandler from './components/weather.js';
import statusHandler from './components/status.js';

const app = express();
app.use(express.json());

const SESSION_PATH = './whatsapp-session/tokens';

if (!fs.existsSync(SESSION_PATH)) {
  fs.mkdirSync(SESSION_PATH, { recursive: true });
}

async function createBot() {
  try {
    const client = await venom.create({
      session: 'whatsapp-bot',
      multidevice: true,
      headless: true, // שימוש ב-headless mode רגיל
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      folderNameToken: 'tokens',
      mkdirFolderToken: SESSION_PATH
    });

    // הוספת השהייה של 5 שניות
    await new Promise(resolve => setTimeout(resolve, 5000));

    start(client);
  } catch (error) {
    console.error('Error creating bot:', error);
  }
}

createBot();

function start(client) {
  client.onMessage(async (message) => {
    try {
      const text = message.body.trim().toLowerCase();
      const from = message.from; // המספר ששלח את ההודעה
      const name = message.notifyName || message.pushname || 'חבר ללא שם'; // שם המשתמש אם קיים
      console.log(text);
      console.log(from, " : ", name);
      if (text === 'מזג האוויר') {
        await weatherHandler(client, message);
      } else if (text === 'מה קורה') {
        await statusHandler(client, message);
      // } else {
      //   await client.sendText(message.from, 'לא הבנתי את הבקשה שלך.');
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  app.post('/send-message', async (req, res) => {
    const { message, to } = req.body;
    try {
      await client.sendText(to, message);
      res.send({ status: 'Message sent' });
    } catch (error) {
      console.error('Error in send-message API:', error);
      res.status(500).send({ status: 'Error', message: error.message });
    }
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
