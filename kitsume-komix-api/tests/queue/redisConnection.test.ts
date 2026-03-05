import { assertEquals } from "@std/assert";
import IORedis from "ioredis";
import { redisConnection } from "#db/redis/redisConnection.ts";

Deno.test({
  name: "Redis connection - should successfully connect to Redis instance",
  async fn() {
    const redis = new IORedis.default({
      host: redisConnection.host,
      port: redisConnection.port,
      maxRetriesPerRequest: redisConnection.maxRetriesPerRequest,
      lazyConnect: true,
    });

    try {
      // Attempt to connect
      await redis.connect();

      // Verify connection with PING command
      const pong = await redis.ping();
      assertEquals(pong, "PONG", "Redis should respond with PONG to PING command");

      // Test a basic SET/GET operation
      const testKey = "test:redis:health";
      const testValue = `test-${Date.now()}`;
      
      await redis.set(testKey, testValue, "EX", 10); // expires in 10 seconds
      const retrievedValue = await redis.get(testKey);
      
      assertEquals(retrievedValue, testValue, "Redis should store and retrieve values correctly");

      // Cleanup
      await redis.del(testKey);
    } finally {
      // Always disconnect
      await redis.quit();
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Redis connection - should report connection status",
  async fn() {
    const redis = new IORedis.default({
      host: redisConnection.host,
      port: redisConnection.port,
      lazyConnect: true,
    });

    try {
      await redis.connect();
      
      // Check status
      assertEquals(redis.status, "ready", "Redis client should be in ready state");
      
      // Verify info command works
      const info = await redis.info("server");
      assertEquals(typeof info, "string", "Redis INFO command should return server information");
    } finally {
      await redis.quit();
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Redis connection - should handle connection errors gracefully",
  async fn() {
    const redis = new IORedis.default({
      host: "invalid-host-that-does-not-exist",
      port: 9999,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't retry
      lazyConnect: true,
    });

    let errorThrown = false;

    try {
      await redis.connect();
    } catch (error) {
      errorThrown = true;
      assertEquals(error instanceof Error, true, "Should throw an error for invalid connection");
    } finally {
      redis.disconnect();
    }

    assertEquals(errorThrown, true, "Connection to invalid host should throw an error");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
