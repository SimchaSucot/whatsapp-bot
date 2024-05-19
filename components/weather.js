// import fetch from 'node-fetch';

// async function getWeatherData(latitude, longitude) {
//   const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Africa%2FCairo&forecast_days=3`);
//   const data = await response.json();

//   if (!data.daily || !data.daily.temperature_2m_max || !data.daily.temperature_2m_min) {
//     throw new Error('Invalid weather data received');
//   }

//   return data.daily;
// }

// async function getUserLocation() {
//   let response = await fetch("https://ipapi.co/json/");
//   let data = await response.json();

//   console.log("IPAPI response data:", data);  // הוספת הודעת דיבאג
//   console.log(data.location);
//   if (!data.latitude || !data.longitude || !data.city) {
//     throw new Error('Invalid location data received');
//   }

//   return {
//     latitude: data.latitude,
//     longitude: data.longitude,
//     city: data.city
//   };
// }

// async function weatherHandler(client, message) {
//   try {
//     const location = await getUserLocation();
//     const weatherData = await getWeatherData(location.latitude, location.longitude);

//     const today = {
//       maxTemp: weatherData.temperature_2m_max[0],
//       minTemp: weatherData.temperature_2m_min[0]
//     };

//     const tomorrow = {
//       maxTemp: weatherData.temperature_2m_max[1],
//       minTemp: weatherData.temperature_2m_min[1]
//     };

//     const overmorrow = {
//       maxTemp: weatherData.temperature_2m_max[2],
//       minTemp: weatherData.temperature_2m_min[2]
//     };

//     const weatherMessage = `
// המזג האוויר באזור שלך ${location.city} הוא:
// היום: ${today.minTemp}°C - ${today.maxTemp}°C
// מחר: ${tomorrow.minTemp}°C - ${tomorrow.maxTemp}°C
// מחרתיים: ${overmorrow.minTemp}°C - ${overmorrow.maxTemp}°C
//     `;

//     await client.sendText(message.from, weatherMessage);
//   } catch (error) {
//     console.error('Error handling weather data:', error);
//     await client.sendText(message.from, 'שגיאה בקבלת נתוני מזג האוויר, נסה שוב מאוחר יותר.');
//   }
// }

// export default weatherHandler;


































// weather.js
import axios from 'axios';

const weatherHandler = async (client, message) => {
  const chatId = message.from;
  await client.sendText(chatId, 'אנא שלח את המיקום שלך כדי שאוכל לספק את נתוני מזג האוויר.');
  client.onMessage(async (locationMessage) => {
    if (locationMessage.type === 'location') {
      const lat = locationMessage.lat;
      const lng = locationMessage.lng ;
      const weatherData = await getWeatherData(lat, lng);
      await client.sendText(chatId, `מזג האוויר כרגע הוא: ${weatherData}`);
    }
  });
};

const getWeatherData = async (lat, lng) => {
  const apiKey = 'YOUR_API_KEY'; // Replace with your weather API key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
  const response = await axios.get(url);
  const data = response.data;
  return `טמפרטורה: ${data.main.temp}°C, ${data.weather[0].description}`;
};

export default weatherHandler;

