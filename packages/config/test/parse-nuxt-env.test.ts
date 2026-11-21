import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseNuxtEnv } from "../src/nuxt";

describe("parseNuxtEnv", () => {
  it("parses flat env into Nuxt runtimeConfig shape", () => {
    const config = parseNuxtEnv({
      PORT: "8080",
      DATABASE_URL: "postgres://user:pass@localhost:5432/kitsune",
      ENV: "production",
    });

    assert.deepStrictEqual(config, {
      PORT: 8080,
      DATABASE_URL: "postgres://user:pass@localhost:5432/kitsune",
      public: { ENV: "production" },
    });
  });

  it("applies defaults for missing optional values", () => {
    assert.deepStrictEqual(parseNuxtEnv({ ENV: "development" }), {
      PORT: 3000,
      DATABASE_URL: "database.sqlite",
      public: { ENV: "development" },
    });
  });

  it("reads process.env when called without arguments", () => {
    process.env.ENV = "test";
    process.env.PORT = "9090";
    try {
      const config = parseNuxtEnv();
      assert.equal(config.PORT, 9090);
      assert.equal(config.public.ENV, "test");
    } finally {
      delete process.env.ENV;
      delete process.env.PORT;
    }
  });

  it("reports failures with the nested public path", () => {
    assert.throws(() => parseNuxtEnv({ ENV: "staging" }), /public\.ENV/);
  });
});
