const { createClient } = require("redis");
const { env } = require("../env");
const logger = require("../logger");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken
} = require("../../common/utils/token_methods");
const { json } = require("stream/consumers");

let redisClient;
async function redis_connection() {
    try {
        const redis_config = {
            username: env.REDIS_USERNAME || undefined,
            password: env.REDIS_PASSWORD || undefined,
            socket: {
                host: env.REDIS_URL,
                port: Number(env.REDIS_PORT) || 6379,
            },
        };

        redisClient = createClient(redis_config);

        redisClient.on("error", (err) => {
            console.error("Redis Client Error:", err);
            logger.error("Redis Client Error: " + (err && err.message));
        });
        redisClient.on("connect", () => {
            console.info("Redis connecting...");
            logger.info("Redis connecting...");
        });
        redisClient.on("ready", () => {
            console.info("Redis ready");
            logger.info("Redis ready");
        });
        redisClient.on("reconnecting", () => {
            console.info("Redis reconnecting");
            logger.info("Redis reconnecting");
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.error("Error connecting to Redis:", error);
        logger.error("Error connecting to Redis: " + (error && error.message));
        throw error; // rethrow so the app can handle/fail-fast if needed
    }

}


// #region Redis Token Storage

// hash a token (use SHA256) before storing
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

const storeTokens = async (userDetails) => {
    if (!redisClient || !redisClient.isOpen) {
        throw new Error("Redis client is not connected. Call redis_connection() first.");
    }
    const session_id = uuidv4();

    const accessToken = await generateAccessToken(userDetails.user_id, session_id);
    const refreshToken = await generateRefreshToken(userDetails.user_id, session_id);

    const key = `REFRESHTOKEN_DATA:${userDetails.user_id}_${session_id}`;
    const value = hashToken(refreshToken);
    const REFRESH_TOKEN_TTL = Number(env.REFRESH_TOKEN_EXPIRES_SEC)
    try {
        await redisClient.setEx(key, REFRESH_TOKEN_TTL, JSON.stringify({
            userDetails,
            refreshToken: value,
        }));
        logger.info(`Stored refresh token with REFRESHTOKEN_DATA:${userDetails.user_id}_${session_id}`);
        return { accessToken, refreshToken };
    } catch (err) {
        console.error("Failed to store refresh token in Redis:", err);
        logger.error("Failed to store refresh token in Redis: " + (err && err.message));
        throw err;
    }
}

// Delete (revoke) one refresh token
const  deleteRefreshToken = async (userId, session_id) => {
    const key = `REFRESHTOKEN_DATA:${userId}_${session_id}`;
    await redisClient.del(key);
}


// Revoke all sessions for user (delete all keys pattern)
async function revokeAllUserRefreshTokens(userId) {
    const pattern = `REFRESHTOKEN_DATA:${userId}_*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(keys);
}

// Verify refresh token against Redis: ensures token hasn't been revoked
async function isRefreshTokenInRedis(userId, session_id, refreshToken) {
    const key = `REFRESHTOKEN_DATA:${userId}_${session_id}`;
    const stored = await redisClient.get(key);
    if (!stored) return false;
    const data = JSON.parse(stored);
    return data.refreshToken === hashToken(refreshToken);
}
// #endregion Redis Token Storage

module.exports = {
    redis_connection,
    storeTokens,
    deleteRefreshToken,
    revokeAllUserRefreshTokens,
    isRefreshTokenInRedis
} 