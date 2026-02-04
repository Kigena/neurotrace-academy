# Case Sharing Debug Guide

## Issue: Unable to Complete Case Sharing After Attaching Image

### Architecture Overview

```
Frontend (Vercel) → Backend API (Render) → MongoDB
     ↓
ShareCase.jsx
     ↓
Step 1: Patient Info
Step 2: EEG Findings  
Step 3: Upload & Publish
     ↓
1. Select File → handleFileSelect()
2. Click "Confirm Upload" → handleAddAttachment()
   - POST /api/cases/upload (with auth)
   - Returns: { url, filename, type, size }
   - Adds to formData.attachments[]
3. Click "Publish Case" → handleSubmit()
   - POST /api/cases (with auth)
   - Returns: new case object
   - Redirects to /cases
```

### Required Environment Variables

**Backend (Render)**:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 5003)
- `CLIENT_URL` - CORS allowed origins (e.g., https://neurotrace-academy2.vercel.app)

**Frontend (Vercel)**:
- `VITE_API_URL` - Backend API URL (e.g., https://neurotrace-academy.onrender.com/api)

### Authentication Flow

1. User logs in → JWT token stored in `localStorage.setItem('token', token)`
2. ApiService reads token → `localStorage.getItem('token')`
3. Added to headers → `Authorization: Bearer ${token}`
4. Backend verifies → `auth` middleware checks JWT

### Common Issues & Solutions

#### 1. **Authentication Errors (401 Unauthorized)**

**Symptoms**: 
- Upload fails with "Authentication required"
- Console shows 401 error

**Causes**:
- User not logged in
- JWT token expired (7 days expiry)
- Token missing from localStorage

**Debug**:
```javascript
// Open browser console and run:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('neurotrace_active_session_v1'))?.user);
```

**Fix**:
- Log out and log back in to refresh token
- Check AuthContext is properly wrapping the app

#### 2. **CORS Errors**

**Symptoms**:
- "Access to fetch has been blocked by CORS policy"
- Network tab shows CORS error

**Causes**:
- `CLIENT_URL` env var not set on backend
- Frontend URL not in CORS whitelist

**Debug**:
```javascript
// Check if API_URL is correct:
console.log('API URL:', import.meta.env.VITE_API_URL || 'https://neurotrace-academy.onrender.com/api');
```

**Fix Backend** (server/src/index.js):
```javascript
app.use(cors({
    origin: ['https://neurotrace-academy2.vercel.app', 'http://localhost:5002'],
    credentials: true
}));
```

#### 3. **File Upload Errors (400 Bad Request)**

**Symptoms**:
- "No file uploaded"
- "Only images and PDFs are allowed"

**Causes**:
- File input not properly bound
- File size > 10MB
- Invalid file type

**Debug**:
```javascript
// Check file before upload:
console.log('File:', file.name, file.type, file.size);
```

**Fix**:
- Ensure file is selected
- Check file size (max 10MB)
- Verify file type (images/PDF only)

#### 4. **Case Creation Errors (500 Internal Server Error)**

**Symptoms**:
- Upload succeeds but publish fails
- "Failed to create case"

**Causes**:
- MongoDB connection issue
- Required fields missing
- patientInfo.age empty string (backend expects null or number)

**Debug**:
```javascript
// Check form data before submission:
console.log('Form Data:', formData);
```

**Fix in Backend** (server/src/routes/cases.js):
```javascript
// Already handled - sanitizes empty age to null
const sanitizedPatientInfo = { ...patientInfo };
if (sanitizedPatientInfo.age === '') {
    sanitizedPatientInfo.age = null;
}
```

#### 5. **Render Cold Start Delays**

**Symptoms**:
- First request times out
- Subsequent requests work

**Causes**:
- Render free tier spins down after inactivity
- Takes ~30-60s to cold start

**Fix**:
- ApiService already has 90s timeout
- Implements automatic retry (max 2 retries)

### Testing Checklist

1. **Before Testing**:
   ```bash
   # Check you're logged in
   - Open browser dev tools
   - Console tab
   - Run: localStorage.getItem('token')
   - Should return a JWT token string
   ```

2. **Test Upload**:
   - Go to /share-case
   - Fill Step 1 & 2
   - Step 3: Select an image
   - Click "Confirm Upload"
   - ✅ Should see: "✅ File uploaded successfully!"
   - ❌ If error: Check console for detailed error message

3. **Test Publish**:
   - After successful upload
   - Optionally add tags
   - Click "Publish Case"
   - ✅ Should see: "✅ Case published successfully!" → redirects to /cases
   - ❌ If error: Check console for detailed error message

### Enhanced Error Messages

The code has been updated with detailed error logging:

**Upload Errors**:
```
Failed to upload file:
[Actual error message from backend]

Please check console for details.
```

**Publish Errors**:
```
Failed to create case:
[Actual error message from backend]

Please check console for details.
```

### Browser Console Commands for Debugging

```javascript
// 1. Check authentication
console.log('Token:', localStorage.getItem('token'));
console.log('Token present:', !!localStorage.getItem('token'));

// 2. Check API URL
console.log('API URL:', import.meta.env.VITE_API_URL || 'https://neurotrace-academy.onrender.com/api');

// 3. Test API connection
fetch('https://neurotrace-academy.onrender.com/api/health')
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);

// 4. Manual file upload test
const testUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    
    const response = await fetch('https://neurotrace-academy.onrender.com/api/cases/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    
    console.log('Status:', response.status);
    console.log('Response:', await response.json());
};
// Usage: Select a file in the UI, then run in console:
// testUpload(document.querySelector('input[type="file"]').files[0])
```

### Network Tab Debugging

1. Open Browser Dev Tools (F12)
2. Go to Network tab
3. Clear existing logs
4. Try uploading a file
5. Look for request to `/api/cases/upload`:
   - **Status 200**: Upload succeeded → check response body
   - **Status 401**: Authentication issue → check token
   - **Status 400**: Bad request → check file/formdata
   - **Status 500**: Server error → check backend logs
   - **Status 0/CORS**: CORS issue → check backend CORS config

### Backend Logs (Render Dashboard)

1. Go to Render dashboard
2. Select your backend service
3. Click "Logs" tab
4. Look for:
   - `❌ MongoDB connection error` - Database issue
   - `Case upload error:` - File upload issue
   - `Create case error:` - Case creation issue

### Quick Fixes

**If nothing works**:

1. **Clear cache and log in again**:
   ```javascript
   localStorage.clear();
   // Then reload page and log in
   ```

2. **Check backend is running**:
   ```bash
   curl https://neurotrace-academy.onrender.com/api/health
   # Should return: {"status":"ok","timestamp":"...","uptime":123,"mongodb":"connected"}
   ```

3. **Check MongoDB connection** (Backend logs should show):
   ```
   ✅ Connected to MongoDB
   ```

### Recent Improvements

✅ **Added**:
- Detailed error messages with actual backend errors
- Console logging at each step
- Visual feedback (green background) for uploaded files
- Remove button for each attachment
- Cancel button during file selection
- File size limit display (Max 10MB)
- Success alerts for upload and publish
- Validation before submission

### Next Steps If Issue Persists

1. Share the exact error message from console
2. Share Network tab screenshot showing failed request
3. Check backend logs on Render dashboard
4. Verify environment variables are set correctly
