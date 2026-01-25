const dotenv = require("dotenv");
const logger = require("./logger");
dotenv.config();


function getEnv(key, required = true) {
  try {
    const value = process.env[key];
    if (required && !value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || "";
  } catch (error) {
    console.log('Catch block error in getEnv()', error.message);
    logger.error(`Catch block error in getEnv() ${error.message}`)
  }
}

const env = {
  PORT: getEnv("PORT", false) || 3000,
  MONGO_URI: getEnv("MONGO_URI", false),
  ALLOWED_DOMINES: getEnv("ALLOWED_DOMINES", false) || "*",
  REDIS_USERNAME: getEnv('REDIS_USERNAME', true),
  REDIS_PASSWORD: getEnv('REDIS_PASSWORD', true),
  REDIS_URL: getEnv('REDIS_URL', true),
  REDIS_PORT: getEnv('REDIS_PORT', true),
  SALT_ROUND: getEnv('SALT_ROUND', false),
  ACCESS_TOKEN_SECRET: getEnv('ACCESS_TOKEN_SECRET', true),
  REFRESH_TOKEN_SECRET: getEnv('REFRESH_TOKEN_SECRET', true),
  ACCESS_TOKEN_EXPIRES: getEnv('ACCESS_TOKEN_EXPIRES', true),
  REFRESH_TOKEN_EXPIRES_SEC: getEnv('REFRESH_TOKEN_EXPIRES_SEC', true),
  IMAGEKIT_PUBLIC_KEY: getEnv('IMAGEKIT_PUBLIC_KEY', true),
  IMAGEKIT_PRIVATE_KEY: getEnv('IMAGEKIT_PRIVATE_KEY', true),
  IMAGEKIT_URLENDPOINT: getEnv('IMAGEKIT_URLENDPOINT', true),
};

module.exports = { env };
