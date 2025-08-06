import { Config } from "./types";

export const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?";

export const CONFIG: Config = {
  aws: {
    region: "eu-west-2",
    bucket: process.env.BUCKET_NAME,
  },
  api: {
    key: process.env.API_KEY,
  },
};
