import test from "node:test";
import assert from "node:assert/strict";
import { consumeUsage, getUsage, resetUsageForTests } from "../lib/usage.ts";

test("usage is tracked independently per workspace", () => {
  resetUsageForTests();
  const first = consumeUsage("workspace-a");
  const second = consumeUsage("workspace-b");
  assert.equal(first?.used, 1);
  assert.equal(second?.used, 1);
  assert.equal(getUsage("workspace-a").used, 1);
});

test("reset clears demo counters", () => {
  resetUsageForTests();
  consumeUsage("workspace-a");
  resetUsageForTests();
  assert.equal(getUsage("workspace-a").used, 0);
});
