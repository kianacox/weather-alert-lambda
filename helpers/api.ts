import { BASE_URL, CONFIG } from "../constants";
import { WindData, OpenWeatherResponse } from "../types";

export const fetchWindData = async (
  latitude: number,
  longitude: number
): Promise<WindData> => {
  const apiKey = CONFIG.api.key;

  if (!apiKey) {
    throw new Error("API key is not configured");
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error(
      "Latitude must be between -90 and 90, and longitude must be between -180 and 180"
    );
  }

  const url = `${BASE_URL}lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching wind data: ${response.statusText}`);
  }

  const data: OpenWeatherResponse = await response.json();

  if (!data || !data.wind) {
    throw new Error("Invalid data received from API");
  }

  const windData: WindData = {
    windSpeed: data.wind.speed,
    windDirection: data.wind.deg,
    timestamp: data.dt * 1000,
  };

  return windData;
};
