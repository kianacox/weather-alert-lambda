const { BASE_URL, CONFIG } = require("../constants");

const fetchWindData = async (latitude, longitude) => {
  const apiKey = CONFIG.api.key;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("Latitude and longitude must be numbers");
  } else if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "Latitude must be between -90 and 90, and longitude must be between -180 and 180"
    );
  }

  const url = `${BASE_URL}lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching wind data: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || !data.wind) {
    throw new Error("Invalid data received from API");
  }

  const windData = {
    windSpeed: data.wind.speed,
    windDirection: data.wind.deg,
    timestamp: data.dt * 1000,
  };

  return windData;
};

module.exports = {
  fetchWindData,
};
