# Edit Case Debugging Guide

## Issue
Edit Case page is showing errors when trying to update/save changes. Console shows:
- "Update failed: Error"
- 404 errors for resources
- Image preview failures

## Enhanced Logging (Just Added)

I've added comprehensive logging to help diagnose the issue. After deploying to Vercel/Render, you'll see detailed logs when updating a case.

### What to Look For in Browser Console

When you click "Update Case", you should see logs in this order:

#### 1. Form Submission Start
```
🚀 handleSubmit called for edit
📤 Updating case: {case-id}
📦 Final data being sent: {
  title: "...",
  history: "...",
  patientInfo: {...},
  medications: [...],
  findings: {...},
  tags: [...],
  attachments: [...]
}
```

#### 2. API Request
```
🔄 PUT request to: https://neurotrace-academy.onrender.com/api/cases/{case-id}
📦 Request body: {...}
```

#### 3. Response (Success)
```
📡 Response status: 200 OK
✅ PUT response: {updated case data}
✅ Case updated successfully: {...}
```

#### 4. Response (Failure)
```
📡 Response status: 404 Not Found (or other error)
❌ PUT request failed
❌ Update failed: {error object}
Error details: {
  message: "...",
  stack: "...",
  name: "..."
}
```

## Common Issues & Solutions

### 1. 404 Not Found
**Symptoms:**
- `Response status: 404 Not Found`
- Error message: "Not Found" or similar

**Possible Causes:**
- Backend route not deployed
- Wrong API URL
- Authentication token expired/invalid

**Solutions:**
1. Check backend deployment on Render
2. Verify `VITE_API_URL` environment variable
3. Check if you're still logged in (try logging out and back in)
4. Check Render logs for backend errors

### 2. 403 Forbidden
**Symptoms:**
- `Response status: 403 Forbidden`
- Error: "You can only edit your own cases"

**Possible Causes:**
- Not the case author
- Not an admin
- User ID mismatch

**Solutions:**
1. Verify you're logged in as the case author
2. Check if you're an admin in MongoDB
3. Check backend logs for user ID comparison

### 3. 500 Internal Server Error
**Symptoms:**
- `Response status: 500 Internal Server Error`
- Generic error message

**Possible Causes:**
- Database connection issue
- Validation error on backend
- Missing required fields
- MongoDB error

**Solutions:**
1. Check Render backend logs
2. Verify all required fields are filled
3. Check database connection
4. Look for validation errors in logs

### 4. Image Preview 404 Errors
**Symptoms:**
- `❌ Image preview failed for: https://...`
- Images showing "Failed to load"

**Note:** These are SEPARATE from the update error. Broken image previews won't prevent updates.

**Cause:**
- Original image upload failed or file was deleted
- URL is incorrect

**Solution:**
- Remove broken attachments and re-upload
- This is why the edit feature was created!

### 5. Tags Processing Issue
**Symptoms:**
- Tags not saving correctly
- Empty tags array

**Fixed:**
The new code now handles both formats:
- Comma-separated: `#Seizure, #Pediatric, #EEG`
- Space-separated: `#Seizure #Pediatric #EEG`

## Debugging Steps

### Step 1: Deploy Updated Code
```bash
# Frontend (Vercel)
git pull origin main
# Vercel will auto-deploy

# Backend (Render)
git pull origin main
# Render will auto-deploy
```

### Step 2: Clear Browser Cache
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear cache and cookies for the site

### Step 3: Open Browser Console
1. Press `F12` or right-click → Inspect
2. Go to "Console" tab
3. Clear console: Click 🚫 icon

### Step 4: Attempt Update
1. Navigate to a case you own
2. Click "Edit" button
3. Make a small change (e.g., add a word to history)
4. Go to Step 3
5. Click "Update Case"
6. **IMMEDIATELY** check console for logs

### Step 5: Copy Logs
Copy the ENTIRE console output and share:
```
Right-click in console → "Save as..." → save to file
```

Or take screenshots showing:
- All console logs from submission
- The error details
- Network tab (if needed)

### Step 6: Check Backend Logs (Render)
1. Go to Render dashboard
2. Click on your backend service
3. Click "Logs" tab
4. Look for logs around the time of the update attempt
5. Look for:
   - `📝 Update case request: {case-id}`
   - `User: {user-id} Role: {role}`
   - Any error messages

## Network Tab Debugging

If logs aren't showing enough info:

### Step 1: Open Network Tab
1. Press `F12` → "Network" tab
2. Clear network log
3. Filter by "Fetch/XHR"

### Step 2: Attempt Update
Click "Update Case" and watch network requests

### Step 3: Find PUT Request
Look for a request like:
```
PUT /api/cases/{case-id}
```

### Step 4: Inspect Request
Click on the request → Look at:
- **Headers** tab: Check Authorization header, Content-Type
- **Payload** tab: See what data was sent
- **Response** tab: See what the server returned
- **Timing** tab: Check for timeout issues

### Step 5: Check Response
- Status code: 200 (success), 404 (not found), 403 (forbidden), 500 (error)
- Response body: Error message or success data

## Expected Data Format

### Request Body (sent to server)
```json
{
  "title": "Case Title",
  "history": "Patient history...",
  "patientInfo": {
    "age": 25,
    "ageUnit": "years",
    "gender": "Male",
    "handedness": "Right"
  },
  "medications": ["Keppra", "Lamictal"],
  "findings": {
    "background": "Normal",
    "interictal": "Sharp waves",
    "ictal": "None",
    "classification": "Focal epilepsy"
  },
  "tags": ["EEG", "Seizure", "Focal"],
  "attachments": [
    {
      "url": "https://neurotrace-academy.onrender.com/uploads/cases/123456-file.png",
      "type": "image",
      "filename": "eeg-trace.png"
    }
  ]
}
```

### Response (success)
```json
{
  "_id": "case-id",
  "title": "Case Title",
  "author": {
    "_id": "user-id",
    "name": "User Name"
  },
  "history": "...",
  "patientInfo": {...},
  "medications": [...],
  "findings": {...},
  "tags": [...],
  "attachments": [...],
  "updatedAt": "2026-02-06T00:00:00.000Z",
  "createdAt": "2026-02-05T00:00:00.000Z"
}
```

## Specific Checks for Your Error

Based on your screenshot, check:

### 1. Authentication
```javascript
// In console, check if token exists:
localStorage.getItem('token')
// Should return a long string (JWT token)
// If null, you need to log in again
```

### 2. User Data
```javascript
// Check current user:
JSON.parse(localStorage.getItem('user'))
// Should show: { id: "...", name: "...", email: "...", role: "..." }
```

### 3. API URL
```javascript
// Check API URL:
import.meta.env.VITE_API_URL
// Should be: https://neurotrace-academy.onrender.com/api
```

### 4. Case ID
```javascript
// In EditCase page console:
console.log(window.location.pathname)
// Should be: /cases/{some-id}/edit
// The ID should be a valid MongoDB ObjectId (24 hex characters)
```

## Quick Fixes to Try

### Fix 1: Re-login
```
1. Log out
2. Clear browser cache
3. Log back in
4. Try editing again
```

### Fix 2: Check Backend Health
Visit: `https://neurotrace-academy.onrender.com/api/health`
Should return: `{ "status": "OK" }` or similar

### Fix 3: Test with Different Case
```
1. Create a NEW case
2. Immediately try to edit it
3. Does the new case edit work?
4. If yes → issue is with old case data
5. If no → issue is with edit feature generally
```

### Fix 4: Simplify Update
```
1. Edit case
2. Only change ONE field (e.g., title)
3. Don't touch attachments
4. Update and see if it works
5. If yes → issue is with attachments
6. If no → issue is elsewhere
```

## What to Share for Help

If still not working, share:

1. **Full console logs** (from submission start to error)
2. **Network request details** (PUT request - headers, payload, response)
3. **Render backend logs** (from the time of the attempt)
4. **Case data** (what case are you trying to edit? ID? Author?)
5. **Your user role** (admin or regular user?)
6. **Steps you took** (exactly what you clicked/typed)

## Backend Route Verification

The backend route should be:
```javascript
// server/src/routes/cases.js
router.put('/:id', auth, async (req, res) => {
  // Line 512+
  // Should log: 📝 Update case request: {id}
});
```

And mounted in:
```javascript
// server/src/index.js
app.use('/api/cases', casesRoutes);
// Should be around line 54
```

## Known Working URL Pattern
```
PUT https://neurotrace-academy.onrender.com/api/cases/{24-character-hex-id}
Headers:
  Content-Type: application/json
  Authorization: Bearer {jwt-token}
Body: {case data as JSON}
```

## Next Steps

1. Deploy the updated code
2. Try editing a case again
3. Copy ALL console logs
4. Share logs + Render backend logs
5. I'll help interpret and fix the specific issue

The enhanced logging will show exactly where the request is failing!
