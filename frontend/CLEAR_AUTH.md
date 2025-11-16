# Clear Authentication Data

If you're seeing the Dashboard button when you're not logged in, it means there's stale authentication data in localStorage.

## Quick Fix - Clear localStorage

### Option 1: Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Run this command:
```javascript
localStorage.clear();
location.reload();
```

### Option 2: Application/Storage Tab
1. Open Developer Tools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Find "Local Storage" in the left sidebar
4. Click on your site (http://localhost:5173)
5. Delete these keys:
   - `isAuthenticated`
   - `isAdminAuthenticated`
   - `instituteId`
   - `instituteName`
6. Refresh the page

### Option 3: Clear Specific Keys Only
Run this in the browser console:
```javascript
localStorage.removeItem('isAuthenticated');
localStorage.removeItem('isAdminAuthenticated');
localStorage.removeItem('instituteId');
localStorage.removeItem('instituteName');
location.reload();
```

## Check Current Auth Status

To see what's stored, run this in console:
```javascript
console.log('isAuthenticated:', localStorage.getItem('isAuthenticated'));
console.log('isAdminAuthenticated:', localStorage.getItem('isAdminAuthenticated'));
console.log('instituteId:', localStorage.getItem('instituteId'));
console.log('instituteName:', localStorage.getItem('instituteName'));
```

## After Clearing

After clearing localStorage:
- You should see "Login" button instead of "Dashboard"
- You should see "Get Started" instead of "Go to Dashboard"
- The landing page should work normally

## Debug Logs

I've added console logs to help debug. Check your browser console for:
- `[LandingNavbar] isAuthenticated from localStorage:`
- `[HeroSection] isAuthenticated from localStorage:`

These will show you what the components are reading from localStorage.
