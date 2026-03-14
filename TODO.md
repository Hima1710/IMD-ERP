# Dev Server Fix TODO

## Steps:
- [x] Gather information and get plan approval
- [x] Wait for `npm install` to complete
- [x] Edit package.json to use local `next` instead of `npx next`:
  - dev: \"next dev -p 3000\"
  - fast-start: \"rd /s /q .next && next dev -p 3000\"
  - build: \"next build\"
  - start: \"next start\"
  - clean: \"rd /s /q \\\".next\\\" 2>nul || true && next dev -p 3000\"
- [x] Run `npm run dev`
- [x] Confirm server running at http://localhost:3000
