# Project Debugging Rules (Non-Obvious Only)

- **stdio Timeout**: MCP stdio communication has a 10000ms timeout default (configurable in `opencode.json`) - long-running API requests will terminate.
- **Atom Feed Elements**: When debugging XML parsing, verify `entry` elements have `<d:title>`, `<d:summary>`, `<d:link rel="alternate">` for `abs_url`.
- **NaN Bug Prevention**: arXiv API returns numeric values as strings in some cases - always use `Number()` or `parseFloat()` when converting API response values.
- **Extension Logs**: Debug MCP protocol messages via OpenCode Extension Host logs, not standard Node output.
