async function statusHandler(client, message) {
    try {
      await client.sendText(message.from, 'הכל בסדר ברוך השם, מה איתך?');
    } catch (error) {
      console.error('Error sending status message:', error);
      await client.sendText(message.from, 'הייתה בעיה בשליחת ההודעה שלך.');
    }
  }
  
  export default statusHandler;
  