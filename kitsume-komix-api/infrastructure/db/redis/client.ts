export const redisConnection = {
  host: Deno.env.get("REDIS_HOST") ?? "redis",
  port: Number(Deno.env.get("REDIS_PORT") ?? 6379),

  // Optional extras for stability in containers:
  maxRetriesPerRequest: null, // recommended for BullMQ
  enableReadyCheck: true,
};
