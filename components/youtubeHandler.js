import ytdl from 'ytdl-core';
import fs from 'fs';

async function youtubeHandler(client, message) {
  await client.sendText(message.from, "עוד כמה שניות וזה מוכן!");

  const url = message.body;
  const videoId = ytdl.getURLVideoID(url);
  const info = await ytdl.getInfo(videoId);
  const videoFormat = ytdl.chooseFormat(info.formats, { quality: '18' });
  console.log(info);

  if (videoFormat) {
    const title = info.videoDetails.title;
    const uploadDate = new Date(info.videoDetails.uploadDate).toLocaleDateString();
    const viewCount = info.videoDetails.viewCount;

    // שולח למשתמש את הכותרת, תאריך היציאה ומספר הצפיות
    await client.sendText(message.from, `*כותרת הסרטון:*\r ${title}`);
    await client.sendText(message.from, `*תאריך יציאת הסרטון:*\r ${uploadDate}`);
    await client.sendText(message.from, `*מספר צפיות:*\r ${viewCount}`);

    const videoStream = ytdl(url, { format: videoFormat });
    const path = `./videos/${videoId}.mp4`;
    const writeStream = fs.createWriteStream(path);

    videoStream.pipe(writeStream);

    writeStream.on('finish', async () => {
      await client.sendFile(message.from, path, `${videoId}.mp4`, 'וזה הסירטון!');
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
