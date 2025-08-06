process.env.API_KEY = "test-api-key";
process.env.BUCKET_NAME = "test-bucket";

import { getCachedData, setCachedData } from "../helpers/cache";
import { mockClient } from "aws-sdk-client-mock";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { WindData } from "../types";

const s3Mock = mockClient(S3Client);

describe("cache helper", () => {
  const mockWindData: WindData = {
    windSpeed: 5.2,
    windDirection: 180,
    timestamp: 1640995200000,
  };

  beforeEach(() => {
    s3Mock.reset();
  });

  describe("getCachedData", () => {
    it("should return cached data when valid and unexpired", async () => {
      const now = Date.now();
      const cacheEntry = { data: mockWindData, timestamp: now };

      const mockBody = {
        transformToString: () => Promise.resolve(JSON.stringify(cacheEntry)),
      };

      s3Mock.on(GetObjectCommand).resolves({ Body: mockBody as any });

      const result = await getCachedData("test-key");

      expect(result).toEqual(mockWindData);
    });

    it("should return null when S3 object has no body", async () => {
      s3Mock.on(GetObjectCommand).resolves({ Body: null as any });

      const result = await getCachedData("test-key");

      expect(result).toBeNull();
    });

    it("should return null when cache entry is expired", async () => {
      const old = Date.now() - 16 * 60 * 1000; // 16 minutes ago (expired)
      const cacheEntry = { data: mockWindData, timestamp: old };

      const mockBody = {
        transformToString: () => Promise.resolve(JSON.stringify(cacheEntry)),
      };

      s3Mock.on(GetObjectCommand).resolves({ Body: mockBody as any });

      const result = await getCachedData("test-key");

      expect(result).toBeNull();
      expect(s3Mock.commandCalls(DeleteObjectCommand).length).toBe(1);
    });

    it("should return null when S3 throws an error", async () => {
      s3Mock.on(GetObjectCommand).rejects(new Error("S3 error"));

      const result = await getCachedData("test-key");

      expect(result).toBeNull();
    });

    it("should return null when JSON parsing fails", async () => {
      const mockBody = {
        transformToString: () => Promise.resolve("invalid json"),
      };

      s3Mock.on(GetObjectCommand).resolves({ Body: mockBody as any });

      const result = await getCachedData("test-key");

      expect(result).toBeNull();
    });

    it("should handle boundary case - exactly at TTL limit", async () => {
      const boundary = Date.now() - 15 * 60 * 1000; // Exactly 15 minutes ago
      const cacheEntry = { data: mockWindData, timestamp: boundary };

      const mockBody = {
        transformToString: () => Promise.resolve(JSON.stringify(cacheEntry)),
      };

      s3Mock.on(GetObjectCommand).resolves({ Body: mockBody as any });

      const result = await getCachedData("test-key");

      expect(result).toEqual(mockWindData);
    });

    it("should handle boundary case - just expired", async () => {
      const justExpired = Date.now() - 15 * 60 * 1000 - 1; // 15 minutes + 1ms ago
      const cacheEntry = { data: mockWindData, timestamp: justExpired };

      const mockBody = {
        transformToString: () => Promise.resolve(JSON.stringify(cacheEntry)),
      };

      s3Mock.on(GetObjectCommand).resolves({ Body: mockBody as any });

      const result = await getCachedData("test-key");

      expect(result).toBeNull();
      expect(s3Mock.commandCalls(DeleteObjectCommand).length).toBe(1);
    });
  });

  describe("setCachedData", () => {
    it("should successfully cache data", async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      await setCachedData("test-key", mockWindData);

      const call = s3Mock.commandCalls(PutObjectCommand)[0];
      expect(call.args[0].input.Body).toContain('"windSpeed":5.2');
      expect(call.args[0].input.Bucket).toBe("test-bucket");
      expect(call.args[0].input.Key).toBe("test-key");
      expect(call.args[0].input.ContentType).toBe("application/json");
    });

    it("should handle S3 errors gracefully", async () => {
      s3Mock.on(PutObjectCommand).rejects(new Error("S3 write error"));

      await expect(
        setCachedData("test-key", mockWindData)
      ).resolves.toBeUndefined();
    });

    it("should include timestamp in cached data", async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      await setCachedData("test-key", mockWindData);

      const call = s3Mock.commandCalls(PutObjectCommand)[0];
      const cachedData = JSON.parse(call.args[0].input.Body as string);

      expect(cachedData).toHaveProperty("data", mockWindData);
      expect(cachedData).toHaveProperty("timestamp");
      expect(typeof cachedData.timestamp).toBe("number");
      expect(cachedData.timestamp).toBeCloseTo(Date.now(), -2); // Within 100ms
    });

    it("should use correct content type", async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      await setCachedData("test-key", mockWindData);

      const call = s3Mock.commandCalls(PutObjectCommand)[0];
      expect(call.args[0].input.ContentType).toBe("application/json");
    });
  });

  describe("integration scenarios", () => {
    it("should handle cache miss then cache hit", async () => {
      // First call - cache miss
      s3Mock.on(GetObjectCommand).rejectsOnce(new Error("NoSuchKey"));

      const result1 = await getCachedData("test-key");
      expect(result1).toBeNull();

      // Second call - cache hit
      const now = Date.now();
      const cacheEntry = { data: mockWindData, timestamp: now };

      const mockBody = {
        transformToString: () => Promise.resolve(JSON.stringify(cacheEntry)),
      };

      s3Mock.on(GetObjectCommand).resolves({ Body: mockBody as any });

      const result2 = await getCachedData("test-key");
      expect(result2).toEqual(mockWindData);
    });

    it("should handle cache expiration cleanup", async () => {
      const expired = Date.now() - 20 * 60 * 1000; // 20 minutes ago
      const cacheEntry = { data: mockWindData, timestamp: expired };

      const mockBody = {
        transformToString: () => Promise.resolve(JSON.stringify(cacheEntry)),
      };

      s3Mock.on(GetObjectCommand).resolves({ Body: mockBody as any });

      const result = await getCachedData("test-key");

      expect(result).toBeNull();
      expect(s3Mock.commandCalls(DeleteObjectCommand).length).toBe(1);
    });
  });
});
