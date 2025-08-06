import { fetchWindData } from "./helpers/api";
import { getCachedData, setCachedData } from "./helpers/cache";
import { CONFIG } from "./constants";
import { APIGatewayProxyEvent, APIGatewayProxyResult, WindData } from "./types";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!CONFIG.api.key) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "API key is missing" }),
    };
  }

  const { lat, lon } = event.queryStringParameters || {};

  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Latitude and longitude parameters are required",
      }),
    };
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Latitude and longitude must be valid numbers",
      }),
    };
  }

  const cacheKey = `wind-data-${lat}_${lon}`;

  const cachedData = await getCachedData(cacheKey);

  if (cachedData) {
    return {
      statusCode: 200,
      body: JSON.stringify(cachedData),
    };
  }

  const data = await fetchWindData(latitude, longitude);

  await setCachedData(cacheKey, data);

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
