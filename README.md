# getWindData Lambda Function

A TypeScript AWS Lambda function that fetches wind data from the OpenWeatherMap API with caching using S3.

## Overview

This Lambda function provides wind speed and direction data for any location on Earth. It's designed to be efficient with a 15-minute TTL cache to minimize API calls and reduce latency.

### Features

- 🌬️ **Wind Data**: Fetches wind speed and direction from OpenWeatherMap API
- ⚡ **Smart Caching**: 15-minute TTL with automatic cache invalidation
- 🗺️ **Global Coverage**: Works with any latitude/longitude coordinates
- 🔒 **Type Safety**: Full TypeScript implementation with strict typing
- 🚀 **Fast Builds**: Uses esbuild for rapid compilation and bundling

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│  Lambda Function │───▶│  OpenWeatherMap │
│                 │    │                 │    │      API        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   S3 Cache      │
                       │   (15min TTL)   │
                       └─────────────────┘
```

### Components

1. **API Gateway**: Receives HTTP requests with lat/lon parameters
2. **Lambda Function**: Processes requests and manages caching logic
3. **S3 Cache**: Stores wind data with 15-minute expiration
4. **OpenWeatherMap API**: External weather data provider

## Technologies

- **Runtime**: Node.js 18.x
- **Language**: TypeScript 5.x
- **Build Tool**: esbuild
- **AWS Services**:
  - Lambda
  - S3 (caching)
  - API Gateway
- **External APIs**: OpenWeatherMap Weather API

## Project Structure

```
getWindData/
├── index.ts                 # Main Lambda handler
├── types.ts                 # TypeScript type definitions
├── constants.ts             # Configuration constants
├── helpers/
│   ├── api.ts              # OpenWeatherMap API integration
│   └── cache.ts            # S3 caching logic with TTL
├── tests/
│   ├── api.test.ts         # Unit tests for API helper
│   └── cache.test.ts       # Unit tests for cache helper
├── build.js                # esbuild configuration
├── jest.config.js          # Jest test configuration
├── package.json            # Dependencies and scripts
├── test-event.json         # Test event for local testing
├── README.md               # Project documentation
├── dist/                   # Compiled output (generated)
└── coverage/               # Test coverage reports (generated)
```

## Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **Node.js** 18.x or higher
3. **OpenWeatherMap API Key** (free tier available)
4. **S3 Bucket** for caching

## Environment Variables

Set these environment variables in your Lambda function:

```bash
API_KEY=your_openweathermap_api_key
BUCKET_NAME=your_s3_bucket_name
```

## Installation & Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure environment**:

   - Get your OpenWeatherMap API key from [OpenWeatherMap](https://openweathermap.org/api)
   - Create an S3 bucket for caching
   - Update Lambda environment variables

3. **Build the function**:
   ```bash
   npm run build
   ```

## Available Scripts

| Script                  | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `npm test`              | Run unit tests                                 |
| `npm run test:watch`    | Run tests in watch mode                        |
| `npm run test:coverage` | Run tests with coverage report                 |
| `npm run build`         | Compile TypeScript to JavaScript using esbuild |
| `npm run zip`           | Create deployment package (lambda.zip)         |
| `npm run deploy`        | Deploy to AWS Lambda                           |
| `npm run lambda`        | Build, zip, and deploy in one command          |

## Deployment

### Quick Deploy

```bash
npm run lambda
```

### Manual Deploy

```bash
npm run build
npm run zip
npm run deploy
```

## API Usage

### Request Format

```
GET /?lat={latitude}&lon={longitude}
```

### Example Request

```bash
curl "https://your-api-gateway-url/?lat=40.7128&lon=-74.0060"
```

### Response Format

```json
{
  "windSpeed": 5.2,
  "windDirection": 180,
  "timestamp": 1640995200000
}
```

### Parameters

- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)

### Response Fields

- `windSpeed`: Wind speed in meters per second
- `windDirection`: Wind direction in degrees (0-360)
- `timestamp`: Unix timestamp in milliseconds

## Error Handling

The function returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing/invalid parameters, missing API key)
- `500`: Internal Server Error (API failures, cache errors)

### Example Error Response

```json
{
  "error": "Latitude and longitude parameters are required"
}
```

## Testing

### Test Framework

The project uses **Jest** with **TypeScript** support for comprehensive unit testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

**Excellent Coverage**: 98.07% statement coverage, 94.44% branch coverage

- **API Helper**: 94.44% statement coverage, 92.85% branch coverage
- **Cache Helper**: 100% statement coverage, 100% branch coverage
- **Constants**: 100% statement coverage

### Test Structure

#### **API Helper Tests** (`tests/api.test.ts`)

- **Coordinate Validation**: Tests for invalid latitude/longitude values
- **Successful API Calls**: Tests for proper data transformation and URL construction
- **API Error Handling**: Tests for various API error scenarios
- **Fetch Error Handling**: Tests for network and JSON parsing errors
- **Environment Variables**: Tests for API key configuration

#### **Cache Helper Tests** (`tests/cache.test.ts`)

- **Cache Retrieval**: Tests for valid, expired, and missing cache entries
- **Cache Storage**: Tests for proper data serialization and S3 operations
- **TTL Management**: Tests for 15-minute expiration logic and boundary cases
- **Error Handling**: Tests for S3 errors and JSON parsing failures
- **Integration Scenarios**: Tests for cache miss/hit patterns and cleanup
- **Boundary Testing**: Tests for exact TTL limits and edge cases

#### **Test Quality**

- **24 total tests** (11 API + 13 Cache)
- **100% function coverage**
- **Edge case coverage** including boundary conditions
- **Integration testing** for real-world scenarios

### Local Lambda Testing

1. **Create test event**:

   ```bash
   # Use the provided test-event.json
   aws lambda invoke --function-name getWindData --payload file://test-event.json response.json
   ```

2. **Test with AWS CLI**:
   ```bash
   aws lambda invoke \
     --function-name getWindData \
     --payload '{"queryStringParameters":{"lat":"40.7128","lon":"-74.0060"}}' \
     response.json
   ```

## Development

### Adding New Features

1. Update types in `types.ts`
2. Implement logic in appropriate helper files
3. Update main handler in `index.ts`
4. Test with `npm run build`

### TypeScript Benefits

- Compile-time error checking
- IntelliSense support
- Refactoring safety
- Better code documentation

## Monitoring & Logging

The function includes comprehensive logging:

- Cache hits/misses
- API call results
- Error conditions
- TTL expiration events

Monitor logs in CloudWatch for:

- Performance metrics
- Error rates
- Cache effectiveness
- API response times

## Cost Optimization

- **Caching**: Reduces API calls by ~95% for repeated requests
- **TTL Management**: Automatic cleanup prevents storage bloat
- **Bundle Size**: Optimized with esbuild for faster cold starts

## Security Considerations

- API keys stored in environment variables
- Input validation for all parameters
- Error messages don't expose sensitive information
- S3 bucket access limited to Lambda execution role
