# Sample resume

Invented profile used for every product screenshot on the marketing site (DESIGN.md section 13). Nobody in these files is a real person and the companies are fictional. Never replace them with a real user's resume.

- `sample-resume.txt`, `sample-job-post.txt`, `sample-section.txt`: inputs.
- `outputs/*.json`: what the three Gemini prompts in `src/lib/gemini-service.js` returned for those inputs, parsed with `src/lib/response-parser.js`. Screenshots are rendered from these.

Screenshots in `public/assets/product/` were captured at 2x in headless Chrome from a temporary route that rendered the real report components with these outputs, then converted to WebP with `sharp`. The route was deleted afterwards; recreate one the same way if the report design changes.

`outputs/section.json` was regenerated on 13 September 2026 after the rewrite prompt gained its truthfulness rules; the earlier output invented metrics ("millions of transactions monthly"). `sample-rewrite.webp` and the homepage before/after were updated from it.
