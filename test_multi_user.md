# 🎯 Multi-User Chat Testing Guide

## 🚀 How to Test User-to-User Communication

### Method 1: Multiple Browser Windows
1. **Open Chrome** → Go to `http://localhost:3000`
2. **Open Firefox** → Go to `http://localhost:3000`
3. **Register different users** in each browser
4. **Join the same room** (e.g., "General")
5. **Start chatting!**

### Method 2: Incognito Windows
1. **Regular window** → Register "Alice"
2. **Incognito window** → Register "Bob"
3. **Both join "General" room**
4. **Send messages back and forth**

### Method 3: Different Devices
1. **Computer** → Register "User1"
2. **Phone/Tablet** → Register "User2"
3. **Both access** `http://localhost:3000`
4. **Chat between devices**

## 🎮 Test Scenarios

### Scenario 1: Basic Chat
- User A: "Hello everyone!"
- User B: "Hi there!"
- User A: "How are you?"
- User B: "I'm good, thanks!"

### Scenario 2: Multiple Users
- User A: "Welcome to the chat!"
- User B: "Thanks!"
- User C: "Hello from another user!"
- All users see all messages instantly

### Scenario 3: Room Switching
- User A joins "General" room
- User B joins "Random" room
- User A switches to "Random" room
- Now both users can chat together

## 🔍 Features You'll See

✅ **Real-time messaging** - Messages appear instantly  
✅ **User presence** - See who's online  
✅ **Join/Leave notifications** - System messages  
✅ **Message history** - Previous messages loaded  
✅ **User identification** - Different colors for own/others  
✅ **Room switching** - Move between chat rooms  

## 🎯 Expected Behavior

1. **User A sends message** → User B sees it immediately
2. **User B replies** → User A sees it immediately
3. **User C joins** → Both A and B see "User C joined"
4. **User A leaves** → User B sees "User A left"
5. **All messages saved** → Check database after chat

## 🗄️ Database Verification

After testing, check the database:
```powershell
cd C:\Users\abhis\Prodigy_4\project
node view_database.js
```

You should see:
- Multiple users registered
- Messages between users
- Timestamps for all activities

## 🚨 Troubleshooting

**If messages don't appear:**
- Check both servers are running
- Refresh browser pages
- Check browser console for errors
- Verify both users are in same room

**If users don't see each other:**
- Make sure both joined same room
- Check network connectivity
- Restart servers if needed 