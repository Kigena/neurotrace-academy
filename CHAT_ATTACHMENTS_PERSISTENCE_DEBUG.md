# Chat Attachments Persistence Debugging Guide

## Issue
Images upload successfully and display immediately, but disappear after page refresh - they're not persisting in the database.

## Root Cause Analysis

The attachments SHOULD be persisting because:
1. ✅ Message model has `attachments` field defined
2. ✅ Socket handlers include `attachments: attachments || []`
3. ✅ Upload endpoint returns full URL
4. ✅ Messages are saved with `message.save()`

**However**, the issue might be:
- Frontend not sending attachments correctly
- Attachments array malformed
- Database not actually saving nested objects
- Retrieval not including attachments

## Enhanced Logging

Added comprehensive logging to track attachments through the entire pipeline:

### 1. Socket Message Reception
```javascript
console.log('📥 Received message:public event', { 
    attachmentsCount: attachments?.length || 0,
    attachments: attachments 
});
```

### 2. Before Save
```javascript
console.log('💾 Saving message with attachments:', {
    messageId: message._id,
    attachmentsCount: message.attachments?.length || 0,
    attachmentDetails: message.attachments
});
```

### 3. After Save
```javascript
console.log('✅ Message saved to DB:', {
    id: message._id,
    hasAttachments: message.attachments && message.attachments.length > 0,
    attachmentsCount: message.attachments?.length || 0
});
```

### 4. On Broadcast
```javascript
console.log('📤 Broadcasting message with attachments:', {
    messageId: message._id,
    attachmentsCount: message.attachments?.length || 0
});
```

### 5. On Retrieval
```javascript
const messagesWithAttachments = messages.filter(m => m.attachments && m.attachments.length > 0);
console.log(`📎 ${messagesWithAttachments.length} messages have attachments`);
```

## Debugging Steps

### Step 1: Check Frontend Console
When uploading an image, look for:
```
📤 Uploading file: test.jpg
✅ Upload response: {url: "https://...", type: "image", ...}
📤 sendPublicMessage called: {attachments: [{...}]}
```

**Expected:** Array with one object containing url, type, filename

### Step 2: Check Server Logs (Render Dashboard)
When message is sent, look for:
```
📥 Received message:public event { attachmentsCount: 1, attachments: [...] }
💾 Saving message with attachments: { attachmentsCount: 1, ... }
✅ Message saved to DB: { hasAttachments: true, attachmentsCount: 1 }
📤 Broadcasting message with attachments: { attachmentsCount: 1 }
```

**If attachmentsCount is 0:** Frontend not sending attachments properly

### Step 3: Check Message Retrieval
When refreshing page, look for:
```
📥 Fetching public messages
✅ Found 10 messages
📎 2 messages have attachments
   Message 123...: 1 attachments [{url: "...", type: "image"}]
```

**If no attachments logged:** Database not saving or retrieving attachments

### Step 4: Direct Database Query
SSH into Render or use MongoDB Atlas UI:
```javascript
db.messages.find({ 
    type: 'public', 
    'attachments.0': { $exists: true } 
}).limit(5)
```

**Check:**
- Do any messages have attachments?
- What does the attachments array look like?
- Are URLs complete?

## Common Issues & Solutions

### Issue 1: Attachments Not Sent from Frontend

**Symptom:** Server logs show `attachmentsCount: 0`

**Check:**
```javascript
// In MessageInput.jsx handleSubmit
console.log('Calling onSend with message and attachments:', { 
    message, 
    attachments 
});
```

**Verify:**
- Upload response is stored in state
- Attachments array is passed to onSend
- Socket emit includes attachments

**Fix:**
```javascript
// Make sure attachments are passed
await onSend(message, attachments); // Not onSend(message)
```

### Issue 2: Attachments Malformed

**Symptom:** Server logs show attachments but they're empty objects or wrong format

**Expected format:**
```javascript
[{
    url: "https://neurotrace-academy.onrender.com/uploads/1234-file.jpg",
    type: "image",
    filename: "test.jpg",
    size: 12345,
    mimetype: "image/jpeg"
}]
```

**Check:**
- URL is complete (starts with https://)
- Type is one of: 'image', 'file', 'document'
- Filename exists

### Issue 3: Database Not Saving Nested Objects

**Symptom:** Message saved but attachments array empty in database

**Check Mongoose Schema:**
```javascript
attachments: [{
    type: {
        type: String,
        enum: ['image', 'file', 'document']
    },
    filename: String,
    url: String,
    size: Number
}]
```

**Verify:**
- Schema matches data structure
- No validation errors
- Save is awaited properly

**Try manual save test:**
```javascript
const testMsg = new Message({
    type: 'public',
    senderId: 'test',
    senderName: 'Test',
    content: 'Test',
    attachments: [{
        type: 'image',
        filename: 'test.jpg',
        url: 'https://example.com/test.jpg'
    }]
});
await testMsg.save();
console.log('Saved:', testMsg.attachments);
```

### Issue 4: Retrieval Not Including Attachments

**Symptom:** Database has attachments but API doesn't return them

**Check query:**
```javascript
const messages = await Message.find(query)
    .select('+attachments') // Explicitly include
    .lean();
```

**Try:**
- Remove `.lean()` temporarily
- Use `.select('attachments')` to explicitly include
- Check if attachments field has `select: false` in schema (it shouldn't)

## Verification Checklist

After deploying enhanced logging:

1. **Upload Test**
   - [ ] Upload image in chat
   - [ ] Check frontend console for upload success
   - [ ] Check frontend console for attachments in sendMessage
   - [ ] Image displays immediately

2. **Server Logs Test**
   - [ ] Open Render dashboard logs
   - [ ] Send message with image
   - [ ] See "Received message" with attachmentsCount: 1
   - [ ] See "Saving message" with attachmentsCount: 1
   - [ ] See "Message saved" with hasAttachments: true
   - [ ] See "Broadcasting" with attachmentsCount: 1

3. **Persistence Test**
   - [ ] Refresh page
   - [ ] Open server logs
   - [ ] See "Fetching public messages"
   - [ ] See "X messages have attachments"
   - [ ] See message IDs with attachment details
   - [ ] Images display after refresh

4. **Database Test**
   - [ ] Query MongoDB directly
   - [ ] Find messages with attachments
   - [ ] Verify URLs are complete
   - [ ] Verify data structure correct

## Next Steps Based on Findings

### If Frontend Issue (attachmentsCount: 0 on server)
1. Check MessageInput.jsx attachment handling
2. Verify onSend receives attachments
3. Check socket emit includes attachments
4. Fix frontend code

### If Server Issue (has attachments but not saved)
1. Check Message model validation
2. Try manual save test
3. Check Mongoose version compatibility
4. Check error logs for validation failures

### If Retrieval Issue (saved but not loaded)
1. Add `.select('+attachments')` to query
2. Remove `.lean()` temporarily
3. Check schema for select: false
4. Verify populate not overwriting

### If Database Issue (nothing saves)
1. Check MongoDB connection
2. Check disk space
3. Check write permissions
4. Try manual insert via Atlas UI

## Temporary Workaround

While debugging, you can manually verify database:

**1. Get database URL from Render:**
```
Settings → Environment → MONGODB_URI
```

**2. Connect via mongosh:**
```bash
mongosh "mongodb+srv://..."
```

**3. Query messages:**
```javascript
use neurotrace
db.messages.find({ type: 'public' }).sort({ timestamp: -1 }).limit(5)
```

**4. Check for attachments:**
```javascript
db.messages.find({ 
    type: 'public',
    attachments: { $ne: [] } 
}).count()
```

**5. See actual attachment data:**
```javascript
db.messages.findOne({ 
    'attachments.0': { $exists: true } 
})
```

## Expected Behavior After Fix

**Upload:**
```
User uploads image
→ File sent to /api/chat/upload
→ Server saves to uploads/
→ Returns absolute URL
→ Frontend stores in attachments array
→ User sends message
→ Frontend emits socket event with attachments
→ Server receives with attachmentsCount: 1
→ Server saves to database with attachments
→ Server broadcasts to all clients
→ All clients receive and display image
```

**Refresh:**
```
Page loads
→ Frontend requests /api/chat/messages?type=public
→ Server queries database
→ Finds messages with attachments
→ Returns messages with full attachment data
→ Frontend renders messages
→ Images display from URLs in database
```

## Monitoring Solution

Once fixed, monitor:

1. **Server logs:**
   - Count of messages with attachments saved
   - Count of messages with attachments retrieved
   - Should match over time

2. **Frontend metrics:**
   - Track upload success rate
   - Track display success rate
   - Track failures to load

3. **Database metrics:**
   - Total messages with attachments
   - Growth over time
   - Average attachments per message

## Related Files

- `server/src/models/Message.js` - Schema definition
- `server/src/socket.js` - Socket handlers
- `server/src/routes/chat.js` - REST endpoints
- `src/components/Chat/MessageInput.jsx` - Upload handling
- `src/contexts/SocketContext.jsx` - Socket messages
- `src/components/Chat/ChatActiveWindow.jsx` - Display

## Support

If issues persist after logging:

1. Collect full logs from both sides
2. Export sample message from database
3. Check network tab for API responses
4. Share findings for debugging

The enhanced logging will reveal exactly where attachments are being lost!
