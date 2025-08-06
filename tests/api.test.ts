process.env.API_KEY = "test-api-key";
process.env.BUCKET_NAME = "test-bucket";

import { fetchWindData } from "../helpers/api";

global.fetch = jest.fn();

describe("fetchWindData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("coordinate validation", () => {
    it("should throw error for latitude > 90", async () => {
      await expect(fetchWindData(91, 0)).rejects.toThrow(
        "Latitude must be between -90 and 90, and longitude must be between -180 and 180"
      );
    });

    it("should throw error for latitude < -90", async () => {
      await expect(fetchWindData(-91, 0)).rejects.toThrow(
        "Latitude must be between -90 and 90, and longitude must be between -180 and 180"
      );
    });

    it("should throw error for longitude > 180", async () => {
      await expect(fetchWindData(0, 181)).rejects.toThrow(
        "Latitude must be between -90 and 90, and longitude must be between -180 and 180"
      );
    });

    it("should throw error for longitude < -180", async () => {
      await expect(fetchWindData(0, -181)).rejects.toThrow(
        "Latitude must be between -90 and 90, and longitude must be between -180 and 180"
      );
    });
  });

  describe("successful API calls", () => {
    it("should fetch wind data successfully", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          wind: { speed: 5.2, deg: 180 },
          dt: 1640995200,
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchWindData(40.7128, -74.006);

      expect(result).toEqual({
        windSpeed: 5.2,
        windDirection: 180,
        timestamp: 1640995200000,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.openweathermap.org/data/2.5/weather?lat=40.7128&lon=-74.006&appid=test-api-key"
      );
    });

    it("should handle different coordinate values", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          wind: { speed: 3.5, deg: 270 },
          dt: 1234567890,
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchWindData(51.5074, 0.1278);

      expect(result).toEqual({
        windSpeed: 3.5,
        windDirection: 270,
        timestamp: 1234567890000,
      });
    });
  });

  describe("API error handling", () => {
    it("should throw error when API returns non-OK status", async () => {
      const mockResponse = {
        ok: false,
        statusText: "Unauthorized",
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWindData(40.7128, -74.006)).rejects.toThrow(
        "Error fetching wind data: Unauthorized"
      );
    });

    it("should throw error when API returns invalid data", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}), // Missing wind property
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWindData(40.7128, -74.006)).rejects.toThrow(
        "Invalid data received from API"
      );
    });

    it("should throw error when API returns null data", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(null),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWindData(40.7128, -74.006)).rejects.toThrow(
        "Invalid data received from API"
      );
    });
  });

  describe("fetch error handling", () => {
    it("should propagate fetch errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(fetchWindData(40.7128, -74.006)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle JSON parsing errors", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(fetchWindData(40.7128, -74.006)).rejects.toThrow(
        "Invalid JSON"
      );
    });
  });
});
