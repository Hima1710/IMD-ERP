# Dev Server Diagnostic Checklist for ERR_CONNECTION_REFUSED

## 1. Port 3000 Check
Run: `netstat -ano | findstr :3000`
- If occupied, note PID and kill with `taskkill /PID <PID> /F`

## 2. Environment Variables
Check `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
- Ensure no quotes, valid URL, full anon key (no truncation).
- Compare with `.env.example` if exists.
- Restart VSCode after changes.

## 3. Cache & Node Modules
```
rmdir /s .next
rmdir /s node_modules
npm install
```

## 4. Middleware Debug
Start server and check terminal for:
```
🔐 [MIDDLEWARE] Auth error: ...
🔐 [MIDDLEWARE] User session exists: ...
🔐 [MIDDLEWARE] No valid session
```
- Errors here indicate Supabase config issues.

## 5. Full Clean Start
```bat
npm run clean
npm run dev
```
Expected: `Local: http://localhost:3000`

## 6. Test Connection
```
curl http://localhost:3000
```
Should return HTML (not refused).

## 7. Firewall/Antivirus
- Temporarily disable to test localhost binding.

## 8. Node Version
`node --version` (should be 18+ for Next.js 14)

---

**Quick Fix Command:**
```bat
netstat -ano | findstr :3000 &amp;&amp; taskkill /F /PID <PID> &amp;&amp; rmdir /s .next &amp;&amp; npm run dev
```
Replace <PID> with actual PID from netstat.

