# Vercel Build Fix TODO

## Plan Steps:
- [ ] 1. Edit package.json: remove @tailwindcss/postcss from devDependencies
- [ ] 2. `pnpm install` to regenerate pnpm-lock.yaml
- [ ] 3. git checkout -b blackboxai/tailwind-postcss-fix
- [ ] 4. git add package.json pnpm-lock.yaml
- [ ] 5. git commit -m "Remove @tailwindcss/postcss dep to fix Vercel PostCSS error"
- [ ] 6. git push -u origin blackboxai/tailwind-postcss-fix
- [ ] 7. gh pr create --title "Fix Vercel PostCSS error" --body "Remove invalid @tailwindcss/postcss v4 with Tailwind v3" --base master
- [ ] 8. Merge PR on GitHub
- [ ] 9. Vercel redeploy

**Merge previous PR #2 first for layout fixes.**

