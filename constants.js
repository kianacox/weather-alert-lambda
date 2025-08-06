const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?";
const CONFIG = {
  aws: {
    region: "eu-west-2",
    bucket: process.env.BUCKET_NAME,
  },
  api: {
    key: process.env.API_KEY,
  },
};

module.exports = {
  BASE_URL,
  CONFIG,
};
