# Delete Features Guide

## Overview
Added deletion capabilities for administrators and users to manage content on the platform.

## Features Implemented

### 1. Admin Case Deletion

**Who:** Administrators only

**Where:** Admin Moderation Panel → Case Details

**How it works:**
1. Navigate to Admin Dashboard
2. Select a case to moderate
3. Scroll to bottom - see "⚠️ Danger Zone"
4. Click "🗑️ Delete Case Permanently"
5. Type "DELETE" to confirm
6. Case is permanently removed

**What gets deleted:**
- ✅ Case document from database
- ✅ All comments/discussions on that case
- ⚠️ Attachments remain on server (can be cleaned up manually if needed)

**Safety features:**
- Requires admin role
- Two-step confirmation (prompt + typing "DELETE")
- Clear warning that action cannot be undone
- Logs deletion in server console

### 2. User Message Deletion (Chat)

**Who:** Message owner or Admin

**Where:** Public Chat, Private Chat, AI Chat

**How it works:**
1. Find your own message in chat
2. Look for 🗑️ icon next to timestamp
3. Click delete icon
4. Confirm deletion
5. Message is removed

**Permissions:**
- ✅ Users can delete **their own messages**
- ✅ Admins can delete **any message**
- ❌ Users cannot delete others' messages

**Visual indicators:**
- Delete button only appears on your own messages
- Appears as 🗑️ emoji next to timestamp
- Hover shows "Delete message" tooltip

### 3. User Comment Deletion (Case Discussions)

**Who:** Comment owner or Admin

**Where:** Case Detail Page → Discussion Section

**How it works:**
1. Find your comment in case discussion
2. Click "Delete" button below comment
3. Confirm deletion
4. Comment is removed, discussion updates

**Permissions:**
- ✅ Users can delete **their own comments**
- ✅ Admins can delete **any comment**
- ❌ Users cannot delete others' comments
- ❌ Cannot delete AI-generated comments (users)

**Visual indicators:**
- "Delete" button appears next to "Reply" for your comments
- Red text with trash icon
- Only visible on your own comments

## Technical Implementation

### Frontend Changes

#### Admin Panel (`src/pages/AdminModeration.jsx`)
```javascript
handleDeleteCase(caseId, caseTitle)
- Prompts for "DELETE" confirmation
- Calls apiService.delete(`/cases/${caseId}`)
- Refreshes case list on success
```

**UI Components:**
- Danger Zone section with red background
- Warning text about permanent deletion
- Delete button with trash icon
- Processing state during deletion

#### Chat Messages (`src/components/Chat/ChatActiveWindow.jsx`)
```javascript
handleDeleteMessage(messageId)
- Confirms deletion with user
- Calls apiService.delete(`/chat/messages/${messageId}`)
- Optimistic UI update
```

**UI Components:**
- 🗑️ icon next to timestamp
- Only shown for own messages
- Inline delete button

#### Case Comments (`src/components/CaseDiscussion.jsx`)
```javascript
handleDeleteComment(commentId)
- Confirms deletion with user
- Calls caseService.deleteComment(caseId, commentId)
- Updates comment list
```

**UI Components:**
- "Delete" button with trash icon
- Red text for danger indication
- Positioned next to "Reply" button

### Backend Changes

#### Case Deletion (`server/src/routes/cases.js`)
```javascript
DELETE /api/cases/:id
- Requires auth middleware
- Checks admin role
- Finds and deletes case
- Returns success message
```

**Security:**
- Admin-only access (403 if not admin)
- Case existence check (404 if not found)
- Comprehensive logging
- MongoDB delete operation

#### Comment Deletion (`server/src/routes/cases.js`)
```javascript
DELETE /api/cases/:id/comment/:commentId
- Requires auth middleware
- Checks ownership or admin role
- Removes comment from array
- Returns updated comments list
```

**Security:**
- Owner or admin only (403 otherwise)
- Comment existence check (404 if not found)
- Ownership verification
- Populated response with user data

#### Message Deletion (`server/src/routes/chat.js`)
```javascript
DELETE /api/chat/messages/:messageId
- Requires auth middleware
- Checks ownership or admin role
- Deletes message from database
- Returns success message
```

**Security:**
- Owner or admin only (403 otherwise)
- Message existence check (404 if not found)
- Ownership verification
- Comprehensive logging

### API Service (`src/services/apiService.js`)
```javascript
async delete(endpoint)
- New DELETE method added
- Handles authentication headers
- Error response parsing
- Timeout handling
```

### Case Service (`src/services/caseService.js`)
```javascript
async deleteComment(caseId, commentId)
- Calls API delete endpoint
- Returns updated comments
- Error handling
```

## User Experience

### Admin Deleting a Case

**Step by step:**
1. Log in as admin
2. Go to Admin Dashboard
3. Click "Cases" tab
4. Click on case to view details
5. Scroll to "Danger Zone" at bottom
6. Read warning carefully
7. Click "Delete Case Permanently"
8. Prompt appears: "Type DELETE to confirm"
9. Type: DELETE
10. Click OK
11. Success message appears
12. Case list refreshes
13. Case is gone

**If cancelled:**
- Click Cancel on prompt → Nothing happens
- Type wrong text → Alert: "Deletion cancelled"
- Case remains intact

### User Deleting Own Message

**In Chat:**
1. Send a message in chat
2. See your message appear with blue background
3. Look at bottom right of message bubble
4. See timestamp and 🗑️ icon
5. Click 🗑️ icon
6. Confirm deletion
7. Message disappears

**In Case Discussion:**
1. Post comment on case
2. See your comment in discussion
3. See "Reply" and "Delete" buttons below
4. Click "Delete" (red text with icon)
5. Confirm deletion
6. Comment disappears
7. Discussion renumbers

### Admin Deleting Any Content

**Same as user, but:**
- Can delete ANY message (not just own)
- Can delete ANY comment (not just own)
- Can delete entire cases
- Should use responsibly

## Safety & Permissions

### Permission Matrix

| Action | User (Own) | User (Others) | Admin |
|--------|------------|---------------|-------|
| Delete own chat message | ✅ | ❌ | ✅ |
| Delete other's chat message | ❌ | ❌ | ✅ |
| Delete own comment | ✅ | ❌ | ✅ |
| Delete other's comment | ❌ | ❌ | ✅ |
| Delete AI comment | ❌ | ❌ | ⚠️ (use carefully) |
| Delete any case | ❌ | ❌ | ✅ |

### Safeguards

**Case Deletion:**
- ⚠️ Requires admin role
- ⚠️ Two-step confirmation
- ⚠️ Must type "DELETE" exactly
- ⚠️ Cannot be undone
- ⚠️ All discussions deleted
- ⚠️ Logged in console

**Message/Comment Deletion:**
- ✅ Ownership check
- ✅ Confirmation dialog
- ✅ Cannot delete others' (unless admin)
- ⚠️ Cannot be undone
- ✅ Immediate UI update

## Database Impact

### Case Deletion
```javascript
// Deletes from CommunityCase collection
{
    _id: "case_id",
    title: "...",
    comments: [...], // All deleted
    attachments: [...] // Files remain on disk
}
```

**Orphaned data:**
- Attachment files in `uploads/cases/` directory
- May want to run cleanup script periodically

### Message Deletion
```javascript
// Deletes from Message collection
{
    _id: "message_id",
    senderId: "user_id",
    content: "...",
    attachments: [...] // Files remain on disk
}
```

### Comment Deletion
```javascript
// Removes from comments array in CommunityCase
communityCase.comments.pull(commentId)
// Comment subdocument is deleted
```

## Logging & Monitoring

### Server Logs

**Case Deletion:**
```
🗑️ Delete case request: case_id
User: user_id Role: admin
🗑️ Deleting case: {
    id: "...",
    title: "...",
    author: "...",
    status: "..."
}
✅ Case deleted successfully
```

**Message Deletion:**
```
🗑️ Delete message request: {
    messageId: "...",
    userId: "...",
    userRole: "..."
}
✅ Message deleted successfully
```

**Comment Deletion:**
```
🗑️ Delete comment request: {
    caseId: "...",
    commentId: "...",
    userId: "..."
}
✅ Comment deleted successfully
```

### Analytics to Track

**Admin actions:**
- Number of cases deleted per day
- Number of messages deleted by admin
- Number of comments deleted by admin
- Which admin performed deletions

**User actions:**
- Number of own messages deleted
- Number of own comments deleted
- Average time before deletion
- Most deleted content types

## Error Handling

### Frontend Errors

**Network error:**
```javascript
alert('Failed to delete: Network error')
```

**Permission denied:**
```javascript
alert('Failed to delete: You can only delete your own content')
```

**Not found:**
```javascript
alert('Failed to delete: Content not found')
```

### Backend Errors

**404 - Not Found:**
```json
{
    "error": "Case not found"
}
```

**403 - Forbidden:**
```json
{
    "error": "Admin access required"
}
// or
{
    "error": "You can only delete your own comments"
}
```

**500 - Server Error:**
```json
{
    "error": "Failed to delete case"
}
```

## Best Practices

### For Admins

**When to delete cases:**
- ✅ Contains PHI (patient identifiable info)
- ✅ Violates terms of service
- ✅ Spam or malicious content
- ✅ Duplicate submission
- ❌ Don't delete just because you disagree

**When to delete messages/comments:**
- ✅ Spam or abuse
- ✅ PHI leaked
- ✅ Harassment or threats
- ✅ User requests deletion
- ❌ Don't suppress legitimate disagreement

**Communication:**
- Consider warning user first
- Document reason for deletion
- Keep internal notes
- Follow community guidelines

### For Users

**Think before posting:**
- Can't recover deleted content
- Others may have already read it
- Screenshots may exist
- Consider editing instead

**When to delete own content:**
- ✅ Accidental post
- ✅ Wrong information
- ✅ Duplicate post
- ✅ Privacy concern
- ❌ To hide from consequences

## Testing Checklist

### Case Deletion
- [ ] Admin can delete pending case
- [ ] Admin can delete published case
- [ ] Admin can delete rejected case
- [ ] Non-admin cannot delete case
- [ ] Confirmation required
- [ ] Must type "DELETE" exactly
- [ ] Case removed from list
- [ ] Comments deleted with case
- [ ] Success message shown

### Message Deletion
- [ ] User can delete own message in public chat
- [ ] User can delete own message in private chat
- [ ] User can delete own message in AI chat
- [ ] User cannot delete others' messages
- [ ] Admin can delete any message
- [ ] Delete button only shows on own messages
- [ ] Confirmation dialog appears
- [ ] Message disappears immediately
- [ ] No errors in console

### Comment Deletion
- [ ] User can delete own comment
- [ ] User cannot delete others' comments
- [ ] Admin can delete any comment
- [ ] Delete button shows on own comments
- [ ] Reply button and delete button together
- [ ] Confirmation dialog appears
- [ ] Comment removed from list
- [ ] Discussion updates correctly
- [ ] AI comments protected for users

## Future Enhancements

### Soft Delete
- Mark as deleted instead of removing
- Allow recovery within timeframe
- Show [deleted] placeholder
- Admin can view deleted content

### Delete Reason
- Require reason for admin deletions
- Track deletion reasons
- Generate moderation reports
- Appeal process

### Bulk Operations
- Select multiple messages
- Delete all messages in conversation
- Archive instead of delete
- Export before delete

### Notifications
- Notify user when admin deletes their content
- Email with reason (optional)
- Appeal mechanism
- Transparency report

### Audit Trail
- Full deletion history
- Who deleted what when
- Reason recorded
- Before/after snapshots

## Support & Troubleshooting

### "Failed to delete"

**Possible causes:**
1. Not authenticated → Log in again
2. No permission → Check you own the content
3. Network error → Check internet connection
4. Server error → Try again or contact admin

### "You can only delete your own content"

**Solution:**
- You're trying to delete someone else's content
- Only admins can delete others' content
- Contact admin if you need something removed

### Deleted content still showing

**Possible causes:**
1. Page not refreshed → Refresh browser
2. Cache issue → Clear browser cache
3. Database delay → Wait a few seconds
4. Error occurred → Check if error message shown

### Case won't delete

**Check:**
1. Are you admin? → Check your role in database
2. Does case exist? → Verify case ID
3. Network timeout? → Server may be cold starting
4. Database error? → Check server logs

## Related Documentation

- `ADMIN_SETUP_GUIDE.md` - Admin role setup
- `MODERATION_SYSTEM_SUMMARY.md` - Content moderation
- `USER_MANAGEMENT_GUIDE.md` - User permissions
- API documentation for delete endpoints
