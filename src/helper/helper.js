const axios= require("axios")
function formatWeatherMessage(data) {
    const location = data.location;
    const current = data.current;

    const message = `
    
        Weather in ${location.name}, ${location.region}, ${location.country}:
        🌡 Temperature: ${current.temp_c}°C (${current.temp_f}°F)
        🌬 Wind: ${current.wind_kph} km/h from ${current.wind_dir}
        💧 Humidity: ${current.humidity}%
        ☁️ Cloudiness: ${current.cloud}%
        🌊 Visibility: ${current.vis_km} km (${current.vis_miles} miles)
        🌞 UV Index: ${current.uv}
        🌪 Gust Speed: ${current.gust_kph} km/h

        Last updated on ${current.last_updated}
    `;

    return message;
}

async function fetchCities() {
    const response = await axios.get(
      "https://raw.githubusercontent.com/nshntarora/Indian-Cities-JSON/master/cities.json"
    );
    return response;
  }

module.exports = {
    formatWeatherMessage,
    fetchCities
}