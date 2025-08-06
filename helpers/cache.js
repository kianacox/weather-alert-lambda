const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { CONFIG } = require("../constants");

const s3Client = new S3Client({ region: CONFIG.aws.region });

const TTL_MINUTES = 15;

const getCachedData = async (cacheKey) => {
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
    const cachedData = JSON.parse(bodyContents);

    const now = Date.now();
    const dataAge = now - cachedData.timestamp;
    const ttlMs = TTL_MINUTES * 60 * 1000;

    if (dataAge > ttlMs) {
      console.log(`Cache entry expired. Age: ${dataAge}ms, TTL: ${ttlMs}ms`);
      return null;
    }

    return cachedData.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const setCachedData = async (cacheKey, data) => {
  const cacheEntry = {
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

module.exports = {
  getCachedData,
  setCachedData,
};
