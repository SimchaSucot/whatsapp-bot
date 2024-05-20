import fetch from 'node-fetch';

async function getWeatherData(latitude, longitude) {
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Africa%2FCairo&forecast_days=3`);
  const data = await response.json();

  if (!data.daily || !data.daily.temperature_2m_max || !data.daily.temperature_2m_min) {
    throw new Error('Invalid weather data received');
  }

  return data.daily;
}

async function getCityName(latitude, longitude) {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
  const data = await response.json();

  if (!data.address || !data.address.city) {
    throw new Error('Invalid location data received');
  }

  return data.address.city;
}

async function weatherHandler(client, message) {
  try {
    let latitude, longitude, city;

    if (message.type === 'location') {
      latitude = message.lat;
      longitude = message.lng;
      city = await getCityName(latitude, longitude);
    } else {
      await client.sendText(message.from, 'אנא שלח את המיקום שלך כדי לקבל את תחזית מזג האוויר.');
      return;
    }

    const weatherData = await getWeatherData(latitude, longitude);

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
המזג האוויר באזור שלך ${city} הוא:
היום: ${today.minTemp}°C - ${today.maxTemp}°C
מחר: ${tomorrow.minTemp}°C - ${tomorrow.maxTemp}°C
מחרתיים: ${overmorrow.minTemp}°C - ${overmorrow.maxTemp}°C
    `;

    await client.sendText(message.from, weatherMessage);
  } catch (error) {
    console.error('Error handling weather data:', error);
    await client.sendText(message.from, 'שגיאה בקבלת נתוני מזג האוויר, נסה שוב מאוחר יותר.');
  }
}

export default weatherHandler;
