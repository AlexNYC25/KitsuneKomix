import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseNodeEnv } from "../src/node";

describe("parseNodeEnv", () => {
  it("parses and coerces provided env values", () => {
    const env = parseNodeEnv({
      PORT: "8080",
      DATABASE_URL: "postgres://user:pass@localhost:5432/kitsune",
      ENV: "production",
    });

    assert.deepStrictEqual(env, {
      PORT: 8080,
      DATABASE_URL: "postgres://user:pass@localhost:5432/kitsune",
      ENV: "production",
    });
  });

  it("applies defaults for missing optional values", () => {
    assert.deepStrictEqual(parseNodeEnv({ ENV: "development" }), {
      PORT: 3000,
      DATABASE_URL: "database.sqlite",
      ENV: "development",
    });
  });

  it("reads process.env when called without arguments", () => {
    process.env.PORT = "9090";
    process.env.ENV = "test";
    try {
      const env = parseNodeEnv();
      assert.equal(env.PORT, 9090);
      assert.equal(env.ENV, "test");
    } finally {
      delete process.env.PORT;
      delete process.env.ENV;
    }
  });

  it("throws on invalid enum value", () => {
    assert.throws(() => parseNodeEnv({ ENV: "staging" }), /ENV/);
  });

  it("throws when required ENV is missing", () => {
    assert.throws(() => parseNodeEnv({}), /ENV/);
  });
});
