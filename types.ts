// Re-export AWS Lambda types for convenience
export type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export interface Config {
  aws: {
    region: string;
    bucket: string | undefined;
  };
  api: {
    key: string | undefined;
  };
}

export interface WindData {
  windSpeed: number;
  windDirection: number;
  timestamp: number;
}

export interface OpenWeatherResponse {
  wind: {
    speed: number;
    deg: number;
  };
  dt: number;
}

export interface CacheEntry {
  data: WindData;
  timestamp: number;
}
