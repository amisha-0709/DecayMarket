---
name: Demo listing persistence
description: Why the marketplace's listings remain local to each browser after migration.
---

The marketplace currently treats listings and claims as a browser-local demo, not shared marketplace records.

**Why:** The imported product was a prototype with local browser persistence and seeded examples. Moving listings to a shared database during the port would alter reset behavior and the apparent ownership of demo listings rather than preserve its existing flow.

**How to apply:** For work explicitly extending the product into a real multi-user marketplace, plan shared persistence and ownership as a new feature. For parity maintenance, keep the browser-local behavior and seed/reset semantics.