// components/weather.js
import fetch from 'node-fetch';

async function getWeatherData(latitude, longitude) {
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Africa%2FCairo&forecast_days=3`);
  const data = await response.json();
  return data.daily;
}

async function getUserLocation(phoneNumber) {
  // כאן יש להוסיף לוגיקה להשגת המיקום לפי מספר הטלפון
  // לצורך דוגמה זו, נחזיר מיקום קבוע
  return { latitude: 31.7683, longitude: 35.2137, city: 'Jerusalem' }; // מיקום של ירושלים
}

async function weatherHandler(client, message) {
  const phoneNumber = message.from;
  const location = await getUserLocation(phoneNumber);

  const weatherData = await getWeatherData(location.latitude, location.longitude);

  const today = {
    maxTemp: weatherData.temperature_2m_max[0],
    minTemp: weatherData.temperature_2m_min[0]
  };

  const tomorrow = {
    maxTemp: weatherData.temperature_2m_max[1],
    minTemp: weatherData.temperature_2m_min[1]
  };

  const overmorrow = {
    maxTemp: weatherData.temperature_2m_max[2],
    minTemp: weatherData.temperature_2m_min[2]
  };

  const weatherMessage = `
המזג האוויר באזור שלך ${location.city} הוא:
היום: ${today.minTemp}°C - ${today.maxTemp}°C
מחר: ${tomorrow.minTemp}°C - ${tomorrow.maxTemp}°C
מחרתיים: ${overmorrow.minTemp}°C - ${overmorrow.maxTemp}°C
  `;

  await client.sendText(message.from, weatherMessage);
}

export default weatherHandler;
