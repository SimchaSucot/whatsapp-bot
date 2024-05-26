import ytdl from 'ytdl-core';
import fs from 'fs';

async function youtubeHandler(client, message) {
  try {
    await client.sendText(message.from, "עוד כמה שניות וזה מוכן!");

    const url = message.body;
    const videoId = ytdl.getURLVideoID(url);
    const info = await ytdl.getInfo(videoId);
    const videoFormat = ytdl.chooseFormat(info.formats, { quality: '18' });

    // הגבלת גודל הווידאו, ניתן לשנות את הערך לפי הצורך
    const videoSize = parseInt(videoFormat.contentLength, 10);
    const maxVideoSize = 70 * 1024 * 1024; // למשל 70MB
    if (videoSize > maxVideoSize) {
      await client.sendText(message.from, `הסרטון גדול מדי(${(videoSize / 1048576).toFixed(1)}MB). אנא נסה סרטון קצר יותר.`);
      return;
    }

    if (videoFormat) {
      const title = info.videoDetails.title;
      const uploadDate = new Date(info.videoDetails.uploadDate).toLocaleDateString();
      const viewCount = info.videoDetails.viewCount;

      await client.sendText(message.from, `*כותרת הסרטון:*\r ${title}`);
      await client.sendText(message.from, `*תאריך יציאת הסרטון:*\r ${uploadDate}`);
      await client.sendText(message.from, `*מספר צפיות:*\r ${viewCount}`);

      const videoStream = ytdl(url, { format: videoFormat });
      const path = `./videos/${videoId}.mp4`;
      const writeStream = fs.createWriteStream(path);

      const timeout = setTimeout(async () => {
        await client.sendText(message.from, 'לוקח קצת יותר זמן מכיון שהסרטון כבד או שאין קליטה טובה מספיק');
      }, 1300); // 13 שניות

      videoStream.pipe(writeStream);

      writeStream.on('finish', async () => {
        clearTimeout(timeout);
        try {
          console.log('Finished downloading the video');
          await client.sendFile(message.from, path, `${videoId}.mp4`, `וזה הסירטון (${(videoSize / 1048576).toFixed(1)}MB)`);
          console.log('Video sent successfully');
          fs.unlinkSync(path);
        } catch (sendError) {
          console.error('Error sending the video file', sendError);
          await client.sendText(message.from, 'There was an error sending your video. Please try again later.');
        }
      });

      writeStream.on('error', async (writeError) => {
        clearTimeout(timeout);
        console.error('Error writing the video file', writeError);
        await client.sendText(message.from, 'There was an error downloading your video. Please try again later.');
      });
    } else {
      await client.sendText(message.from, 'Sorry, I could not find a suitable format to download.');
    }
  } catch (error) {
    console.error('Error processing the video:', error);
    await client.sendText(message.from, 'There was an error processing your request. Please try again later.');
  }
}

export default youtubeHandler;
