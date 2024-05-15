import venom from 'venom-bot';
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

const SESSION_PATH = './whatsapp-session/tokens';

if (!fs.existsSync(SESSION_PATH)) {
  fs.mkdirSync(SESSION_PATH, { recursive: true });
}

venom
  .create({
    session: 'whatsapp-bot', // שם הסשן (יכול להיות כל שם)
    multidevice: true, // שימוש ב-multidevice אם יש צורך
    headless: true, // הרצת הדפדפן במצב headless (ללא ממשק גרפי)
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
    folderNameToken: 'tokens', // שם התיקיה לשמירת ה-token
    mkdirFolderToken: SESSION_PATH // נתיב לתיקיה לשמירת ה-token
  })
  .then((client) => start(client))
  .catch((error) => {
    console.log(error);
  });

function start(client) {
  client.onMessage((message) => {
    client.sendText(message.from, 'HIIIIIIIII');
  });

  app.post('/send-message', (req, res) => {
    const { message, to } = req.body;
    client.sendText(to, message)
      .then(() => {
        res.send({ status: 'Message sent' });
      })
      .catch((error) => {
        res.status(500).send({ status: 'Error', message: error });
      });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
