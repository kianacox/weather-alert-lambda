const { fetchWindData } = require("./helpers/api");
const { getCachedData, setCachedData } = require("./helpers/cache");
const { CONFIG } = require("./constants");

exports.handler = async (event) => {
  if (!CONFIG.api.key) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "API key is missing" }),
    };
  }

  const cacheKey = `wind-data-${event.queryStringParameters.lat}_${event.queryStringParameters.lon}`;

  const cachedData = await getCachedData(cacheKey);

  if (cachedData) {
    return {
      statusCode: 200,
      body: JSON.stringify(cachedData),
    };
  }

  const data = await fetchWindData(
    event.queryStringParameters.lat,
    event.queryStringParameters.lon
  );

  await setCachedData(cacheKey, data);

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
