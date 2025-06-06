---
"@bigcommerce/catalyst-core": minor
---

Enable cart restoration on non-persistent cart logouts.

### Migration

Update the logout mutation to include the `cartEntityId` variable + the `cartUnassignResult` node and make sure the `client.fetch` method contains the new variable.
```diff
-mutation LogoutMutation {
+mutation LogoutMutation($cartEntityId: String) {
-  logout {
+  logout(cartEntityId: $cartEntityId) {
    result
+    cartUnassignResult {
+      cart {
+        entityId
+      }
+    }
  }
}
```
