# Login Performance Optimization TODO

## Steps:
- [x] 1. Create this TODO.md file ✅
- [x] 2. Verify/create valid public/manifest.json and check app/layout.tsx link ✅
- [x] 3. Update hooks/use-store.tsx: Add isLoaded flag, skip fetch if data exists, prevent concurrent requests ✅
- [x] 4. Update app/login/page.tsx: Add router.prefetch('/') before push ✅
- [x] 5. Update hooks/use-offline-sync.ts: Wrap initial sync in requestIdleCallback/setTimeout for post-load ✅
- [ ] 6. Test login speed, check console logs for single [STORE] fetch
- [ ] 7. Complete task with attempt_completion

**Status:** All code updates complete! Manifest fixed, double-fetch prevented, prefetch added, sync delayed. Ready for testing. Run `run-dev.bat` to test login speed.
