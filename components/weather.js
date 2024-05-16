async function weatherHandler(client, message, from, name) {
    try {
      const buttons = [
        { buttonId: 'weather_today', buttonText: { displayText: 'היום' }, type: 1 },
        { buttonId: 'weather_tomorrow', buttonText: { displayText: 'מחר' }, type: 1 },
        { buttonId: 'weather_day_after_tomorrow', buttonText: { displayText: 'מחרתיים' }, type: 1 }
      ];
  
      await client.sendButtons(
        message.from,
        `שלום ${name}, איזה יום אתה רוצה?`,
        buttons,
        'בחר יום לקבלת התחזית:'
      );
    } catch (error) {
      console.error('Error sending weather buttons:', error);
      await client.sendText(message.from, 'לא ניתן לשלוח כפתורים כרגע.');
    }
  }
  
  async function handleWeatherChoice(client, message) {
    try {
      const dayMapping = {
        'weather_today': 'היום',
        'weather_tomorrow': 'מחר',
        'weather_day_after_tomorrow': 'מחרתיים'
      };
  
      const day = dayMapping[message.selectedButtonId];
      if (!day) {
        await client.sendText(message.from, 'לא ניתן לזהות את הבחירה שלך.');
        return;
      }
  
      const weatherResponse = await axios.get(`YOUR_WEATHER_API_URL&day=${day}`);
      const weatherData = weatherResponse.data;
      const weatherText = `תחזית ל${day}: ${weatherData.weather[0].description}, טמפרטורה: ${weatherData.main.temp}°C`;
  
      await client.sendText(message.from, weatherText);
    } catch (error) {
      console.error('Error fetching weather:', error);
      await client.sendText(message.from, 'לא ניתן להביא את מזג האוויר כרגע.');
    }
  }
  
  export default weatherHandler;
  export { handleWeatherChoice };
  