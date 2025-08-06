import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { CONFIG } from "../constants";
import { WindData, CacheEntry } from "../types";

const s3Client = new S3Client({ region: CONFIG.aws.region });

const TTL_MINUTES = 15;

export const getCachedData = async (
  cacheKey: string
): Promise<WindData | null> => {
  const command = new GetObjectCommand({
    Bucket: CONFIG.aws.bucket,
    Key: cacheKey,
  });

  try {
    const response = await s3Client.send(command);
    if (!response.Body) {
      return null;
    }

    const bodyContents = await response.Body.transformToString();
    const cachedData: CacheEntry = JSON.parse(bodyContents);

    const now = Date.now();
    const dataAge = now - cachedData.timestamp;
    const ttlMs = TTL_MINUTES * 60 * 1000;

    if (dataAge > ttlMs) {
      console.log(`Cache entry expired. Age: ${dataAge}ms, TTL: ${ttlMs}ms`);
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: CONFIG.aws.bucket,
          Key: cacheKey,
        })
      );
      return null;
    }

    return cachedData.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const setCachedData = async (
  cacheKey: string,
  data: WindData
): Promise<void> => {
  const cacheEntry: CacheEntry = {
    data: data,
    timestamp: Date.now(),
  };

  const command = new PutObjectCommand({
    Bucket: CONFIG.aws.bucket,
    Key: cacheKey,
    Body: JSON.stringify(cacheEntry),
    ContentType: "application/json",
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error(error);
  }
};
