import IORedis from "ioredis";

export const redisConnection = {
  host: Deno.env.get("REDIS_HOST") ?? "redis",
  port: Number(Deno.env.get("REDIS_PORT") ?? 6379),

  // Optional extras for stability in containers:
  maxRetriesPerRequest: null, // recommended for BullMQ
  enableReadyCheck: true,
};

/**
 * Checks if a connection to Redis can be established using the provided configuration.
 * @returns a promise that resolves to true if the connection is successful, or false if it fails
 */
export const testRedisConnection: () => Promise<boolean> = async () => {
  const redis = new IORedis.default({
    host: redisConnection.host,
    port: redisConnection.port,
    lazyConnect: true, // Don't connect until we need to
  });

  try {
    await redis.connect();

    const pong = await redis.ping();

    if (pong !== "PONG") {
      return false;
    }

    await redis.quit();
    return true;
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    return false;

  }
}