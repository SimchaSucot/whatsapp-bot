// youtubeHandler.js
import ytdl from 'ytdl-core';
import fs from 'fs';

async function youtubeHandler(client, message) {
  const url = message.body;
  const videoId = ytdl.getURLVideoID(url);
  const info = await ytdl.getInfo(videoId);
  const videoFormat = ytdl.chooseFormat(info.formats, { quality: '18' });

  if (videoFormat) {
    const videoStream = ytdl(url, { format: videoFormat });
    const path = `./videos/${videoId}.mp4`;
    const writeStream = fs.createWriteStream(path);

    videoStream.pipe(writeStream);

    writeStream.on('finish', async () => {
      await client.sendFile(message.from, path, `${videoId}.mp4`, 'Here is your video');
      fs.unlinkSync(path); // Delete the video file after sending it
    });

    writeStream.on('error', (error) => {
      console.error('Error writing the video file', error);
      client.sendText(message.from, 'There was an error downloading your video. Please try again later.');
    });
  } else {
    client.sendText(message.from, 'Sorry, I could not find a suitable format to download.');
  }
}

export default youtubeHandler;
