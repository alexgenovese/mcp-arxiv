# Project Coding Rules (Non-Obvious Only)

- **arXiv API Response Parsing**: Always parse Atom feed elements (`entry` for papers) expecting `id`, `title`, `summary`, `updated`, `link` elements; `link` elements may appear as `<d:href>` in Atom 1.0.
- **PDF URL Pattern**: Construct PDF URLs canonically as `https://arxiv.org/pdf/{id}.pdf` where `id` comes from arXiv API response (e.g., `2501.01234`).
- **Compact JSON**: All tool outputs must be compact JSON (no pretty-printing) to minimize token context overhead per OpenCode guidelines.
- **Tool Input Validation**: Validate `max_results` input (default to 10, cap at 20) before constructing API queries to prevent abuse.
- **Arg Parsing**: Use `JSON.parse(stdin.read().toString())` for input, `process.stdout.write(JSON.stringify(output))` for output.
