import venom from 'venom-bot';
import express from 'express';
import fs from 'fs';

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
      headless: 'new', // עדכון שימוש ב-headless mode החדש
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
    start(client);
  } catch (error) {
    console.error('Error creating bot:', error);
  }
}

createBot();

function start(client) {
  client.onMessage(async (message) => {
    try {
      if (message.body.trim().toUpperCase() === 'HI'){
        await client.sendText(message.from, 'HIIIIIIIII');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
