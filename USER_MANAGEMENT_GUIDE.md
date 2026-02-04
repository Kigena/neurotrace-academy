# User Management System - Quick Guide

## 🎉 What's New

Admins can now **create other admins directly from the UI**! No more manual database updates needed.

## 🚀 How It Works

### For Your First Admin

You still need to create the **first admin** using the database (see `ADMIN_SETUP_GUIDE.md`):

```javascript
// MongoDB Shell
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### For All Other Admins

Once you have one admin, it's easy:

1. **Log in as admin**
2. **Go to Admin Dashboard** → Click "🛡️ Moderation" in navbar
3. **Switch to "👥 User Management" tab**
4. **Find the user** in the table
5. **Click "Promote to Admin"** button
6. **Confirm** the action
7. ✅ **Done!** They're now an admin

## 📊 User Management Dashboard

### Overview Stats
At the top, you'll see three cards showing:
- **Total Users** - All registered users
- **Admin Users** - Users with admin privileges
- **Regular Users** - Standard users

### User Table
Shows all users with:
- **User Avatar & Name** - Visual identifier
- **Email** - User's email address
- **Role Badge** - 👑 Admin or 👤 User
- **Join Date** - When they registered
- **Action Button** - Promote or Demote

### Actions Available

#### Promote to Admin
- Click **"Promote to Admin"** on any regular user
- Confirms with a dialog: "👑 Are you sure you want to promote [Name] to admin?"
- Instantly grants admin privileges
- User gains access to:
  - Admin Dashboard
  - Case Moderation
  - User Management

#### Demote to User
- Click **"Demote to User"** on any admin
- Confirms with a dialog: "👤 Are you sure you want to demote [Name] to user?"
- Removes admin privileges
- User loses access to admin features

### Safety Features

🛡️ **Cannot Change Your Own Role**
- The system prevents you from demoting yourself
- This prevents accidental admin lockout
- Shows message: "Cannot change own role"
- Another admin must change your role

## 🔐 Security

### Backend Protection
✅ All endpoints require admin authentication  
✅ Role validated on every request  
✅ Password hashes never exposed  
✅ Audit trail logged to console  

### Frontend Protection
✅ User Management tab only visible to admins  
✅ Action buttons disabled for own account  
✅ Confirmation dialogs for all changes  
✅ Real-time updates after changes  

## 📱 User Experience

### When You Promote Someone:
1. Click "Promote to Admin"
2. See confirmation: "👑 Are you sure..."
3. Confirm
4. See success: "✅ User [Name] is now an admin"
5. Stats update immediately
6. User list refreshes

### What The New Admin Sees:
1. They should **log out and log back in**
2. New JWT token includes admin role
3. "🛡️ Moderation" link appears in navbar
4. Can access Admin Dashboard
5. Can moderate cases
6. Can manage users

## 🧪 Testing Checklist

### Setup
- [ ] Create your first admin via database
- [ ] Log in as that admin
- [ ] Navigate to Admin Dashboard

### Promote User
- [ ] Go to User Management tab
- [ ] See list of all users
- [ ] Find a regular user
- [ ] Click "Promote to Admin"
- [ ] Confirm the dialog
- [ ] See success message
- [ ] Stats update (admin count increases)
- [ ] User row shows 👑 Admin badge

### Demote Admin
- [ ] Find an admin user (not yourself)
- [ ] Click "Demote to User"
- [ ] Confirm the dialog
- [ ] See success message
- [ ] Stats update (admin count decreases)
- [ ] User row shows 👤 User badge

### Safety Check
- [ ] Try to change your own role
- [ ] Should see disabled button
- [ ] Should see "Cannot change own role" message

### New Admin Login
- [ ] Have promoted user log out
- [ ] Have them log back in
- [ ] They should see "🛡️ Moderation" link
- [ ] They can access admin features

## 🎯 Common Scenarios

### Scenario 1: Onboarding First Admin
```
Step 1: Use MongoDB to set role: "admin"
Step 2: User logs out and back in
Step 3: User sees admin features
```

### Scenario 2: Creating More Admins
```
Step 1: Admin logs in
Step 2: Goes to User Management tab
Step 3: Clicks "Promote to Admin" on user
Step 4: New admin logs out/in to see changes
```

### Scenario 3: Removing Admin Access
```
Step 1: Admin goes to User Management
Step 2: Clicks "Demote to User" on admin
Step 3: That user loses admin access immediately
Step 4: They should log out/in to see UI changes
```

### Scenario 4: Multiple Admins
```
- Create 3-5 admins for redundancy
- Prevents lockout if one admin leaves
- Admins can moderate cases independently
- Each admin can create more admins
```

## 💡 Best Practices

### Admin Selection
✅ Choose trusted users only  
✅ Verify their understanding of HIPAA  
✅ Ensure they know PHI detection  
✅ Start with 2-3 admins for redundancy  

### Role Management
✅ Review admin list periodically  
✅ Demote inactive admins  
✅ Document who has admin access  
✅ Never have just one admin (bus factor!)  

### Security
✅ Admins should use strong passwords  
✅ Regular security reviews  
✅ Monitor audit logs  
✅ Train admins on PHI detection  

## 🔍 Troubleshooting

### Issue: "Access Denied" when trying to access User Management

**Cause:** User doesn't have admin role

**Fix:**
1. Verify in database: `db.users.findOne({ email: "user@example.com" })`
2. Should see: `"role": "admin"`
3. Log out and log back in
4. Try again

### Issue: Promoted user doesn't see admin features

**Cause:** JWT token not refreshed

**Fix:**
1. Have user log out completely
2. Have them log back in
3. New JWT includes admin role
4. Admin features now visible

### Issue: Can't see User Management tab

**Cause:** Not logged in as admin or browser cache

**Fix:**
1. Verify you're admin: Check navbar for "🛡️ Moderation"
2. Clear browser cache: `localStorage.clear()`
3. Log out and back in
4. Check again

### Issue: Stats not updating after role change

**Cause:** UI not refreshed

**Fix:**
- Stats should auto-refresh
- If not, switch tabs back and forth
- Or refresh the page

## 📊 API Endpoints

### Get All Users (Admin Only)
```http
GET /api/admin/users
Authorization: Bearer {jwt_token}

Response: Array of users (without passwords)
```

### Update User Role (Admin Only)
```http
PUT /api/admin/users/:userId/role
Authorization: Bearer {jwt_token}
Content-Type: application/json

Body:
{
  "role": "admin" | "user"
}

Response:
{
  "success": true,
  "user": { ... },
  "message": "User [Name] is now an admin"
}
```

### Get Stats (Admin Only)
```http
GET /api/admin/stats
Authorization: Bearer {jwt_token}

Response:
{
  "totalUsers": 10,
  "adminUsers": 2,
  "regularUsers": 8,
  "timestamp": "2024-..."
}
```

## 🎓 Training Your Admins

### What New Admins Should Know:

1. **Case Moderation**
   - Review all submitted cases for PHI
   - Check image headers for identifiers
   - Use moderation notes for feedback
   - Reference: `DEIDENTIFICATION_GUIDE.md`

2. **User Management**
   - Can promote users to admin
   - Cannot demote themselves
   - Should maintain 2-3 admins minimum
   - Be selective with admin access

3. **Best Practices**
   - Review cases within 24-48 hours
   - Provide constructive rejection notes
   - Document patterns in PHI violations
   - Escalate concerning submissions

## 📈 Analytics

Track your admin team:
- **User Management Tab** - See admin count
- **Console Logs** - Role changes logged
- **MongoDB Queries** - Historical role changes

```javascript
// Find all admins
db.users.find({ role: "admin" })

// Count admins
db.users.countDocuments({ role: "admin" })

// Get admin emails
db.users.find({ role: "admin" }, { email: 1, name: 1 })
```

## 🚀 Quick Start Checklist

- [ ] Create first admin via database
- [ ] First admin logs in
- [ ] Goes to Admin Dashboard → User Management
- [ ] Promotes 2-3 trusted users to admin
- [ ] New admins log out/in to see changes
- [ ] Test case moderation access
- [ ] Test user management access
- [ ] Document who has admin access
- [ ] Set up regular admin reviews

## 🎉 Summary

**Before:**
```
To create admin: Manual MongoDB update ❌
Complex: Need database access
Scary: Direct database manipulation
```

**After:**
```
To create admin: Click a button ✅
Easy: Point and click interface
Safe: Built-in validations
```

**Impact:**
- ⚡ Faster admin onboarding
- 🎯 No technical skills needed
- 🔒 Built-in safety checks
- 📊 Visual oversight of users
- 🚀 Scalable admin team

---

**You're all set!** Create your first admin via database, then use the UI for all future admins! 🎊
