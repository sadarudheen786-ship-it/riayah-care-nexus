import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasAdminRole, requiresPageAuthentication } from "./auth-access";

describe("application authentication access rules", () => {
  it("allows only the login and password-reset pages outside the session gate", () => {
    assert.equal(requiresPageAuthentication("/login"), false);
    assert.equal(requiresPageAuthentication("/reset-password"), false);
    assert.equal(requiresPageAuthentication("/"), true);
    assert.equal(requiresPageAuthentication("/leads"), true);
    assert.equal(requiresPageAuthentication("/integrations"), true);
    assert.equal(requiresPageAuthentication("/api/public/webhooks/whatsapp"), false);
  });

  it("grants integration administration only to the admin role", () => {
    assert.equal(hasAdminRole(["admin"]), true);
    assert.equal(hasAdminRole(["coordinator", "finance"]), false);
    assert.equal(hasAdminRole([]), false);
  });
});