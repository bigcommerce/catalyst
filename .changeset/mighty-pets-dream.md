---
'@bigcommerce/create-catalyst': patch
---

Removes `chalk` dependency in favor of `consola` "colorize" utility function (which only depends on `node:tty`)
