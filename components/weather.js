import axios from 'axios';

async function weatherHandler(client, message) {
  try {
    const weatherResponse = await axios.get('YOUR_WEATHER_API_URL');
    const weatherData = weatherResponse.data;
    const weatherText = `מזג האוויר הנוכחי: ${weatherData.weather[0].description}, טמפרטורה: ${weatherData.main.temp}°C`;

    await client.sendText(message.from, weatherText);
  } catch (error) {
    console.error('Error fetching weather:', error);
    await client.sendText(message.from, 'לא ניתן להביא את מזג האוויר כרגע.');
  }
}

export default weatherHandler;
