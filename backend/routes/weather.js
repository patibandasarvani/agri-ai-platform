const express = require('express');
const axios = require('axios');
const router = express.Router();

// @route   GET /api/weather/current/:lat/:lon
// @desc    Get current weather for location
// @access  Private
router.get('/current/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    if (!process.env.WEATHER_API_KEY) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Weather API key not configured'
      });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;

    const response = await axios.get(weatherUrl);
    const weatherData = response.data;

    const formattedWeather = {
      location: {
        name: weatherData.name,
        country: weatherData.sys.country,
        latitude: weatherData.coord.lat,
        longitude: weatherData.coord.lon
      },
      current: {
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        uvIndex: weatherData.uvi || 0,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg,
        cloudCover: weatherData.clouds.all
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      weather: formattedWeather
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get weather data'
    });
  }
});

// @route   GET /api/weather/forecast/:lat/:lon
// @desc    Get 5-day weather forecast
// @access  Private
router.get('/forecast/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    if (!process.env.WEATHER_API_KEY) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Weather API key not configured'
      });
    }

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;

    const response = await axios.get(forecastUrl);
    const forecastData = response.data;

    const formattedForecast = forecastData.list.map(item => ({
      datetime: new Date(item.dt * 1000).toISOString(),
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      windSpeed: item.wind.speed,
      windDirection: item.wind.deg,
      cloudCover: item.clouds.all,
      precipitation: item.rain ? item.rain['3h'] || 0 : 0
    }));

    res.json({
      success: true,
      location: {
        name: forecastData.city.name,
        country: forecastData.city.country,
        latitude: forecastData.city.coord.lat,
        longitude: forecastData.city.coord.lon
      },
      forecast: formattedForecast
    });
  } catch (error) {
    console.error('Weather forecast error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get weather forecast'
    });
  }
});

module.exports = router;
