// components/profilePictureHandler.js

async function profilePictureHandler(client, message) {
  try {
    const profilePicUrl = message.sender.profilePicThumbObj.eurl ;
    if (profilePicUrl) {
      await client.sendFile(
        message.from,
        profilePicUrl,
        'profile.pdf',
        'זו תמונת הפרופיל שלך'
      );
    } else {
      await client.sendText(message.from, 'לא נמצאה תמונת פרופיל.');
    }
  } catch (error) {
    console.error('Error handling profile picture request:', error);
    await client.sendText(message.from, 'שגיאה בקבלת תמונת הפרופיל, נסה שוב מאוחר יותר.');
  }
}

export default profilePictureHandler;
