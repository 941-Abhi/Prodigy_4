const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { dbOperations } = require('./database');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for active users and sockets (for real-time features)
const userSockets = new Map();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await dbOperations.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const userData = {
      id: userId,
      username,
      email,
      password: hashedPassword
    };

    await dbOperations.createUser(userData);

    // Generate JWT token
    const token = jwt.sign({ userId, username }, process.env.JWT_SECRET || 'your-secret-key');

    // Log user registration
    console.log('New user registered:', {
      id: userId,
      username,
      email,
      createdAt: new Date()
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await dbOperations.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || 'your-secret-key');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await dbOperations.getRooms();
    res.json(rooms);
  } catch (error) {
    console.error('Error getting rooms:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await dbOperations.getRoomMessages(roomId);
    res.json(messages);
  } catch (error) {
    console.error('Error getting room messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin endpoint to view all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await dbOperations.getAllUsers();
    res.json({
      totalUsers: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin endpoint to view all messages
app.get('/api/admin/messages', async (req, res) => {
  try {
    const messages = await dbOperations.getAllMessages();
    res.json({
      totalMessages: messages.length,
      messages: messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', async (data) => {
    const { roomId, user } = data;
    
    socket.join(roomId);
    userSockets.set(socket.id, { userId: user.id, username: user.username, roomId });
    
    socket.to(roomId).emit('user_joined', {
      username: user.username,
      timestamp: new Date()
    });
    
    // Get room messages from database
    try {
      const messages = await dbOperations.getRoomMessages(roomId);
      socket.emit('room_joined', {
        roomId,
        messages: messages,
        users: [user.username] // For now, just show current user
      });
    } catch (error) {
      console.error('Error getting room messages:', error);
    }
  });

  socket.on('send_message', async (data) => {
    const { roomId, message, user } = data;
    
    try {
      const messageObj = {
        id: uuidv4(),
        roomId,
        userId: user.id,
        username: user.username,
        message,
        timestamp: new Date()
      };
      
      // Save message to database
      await dbOperations.saveMessage(messageObj);
      
      // Emit to all users in the room
      io.to(roomId).emit('new_message', {
        id: messageObj.id,
        text: messageObj.message,
        user: messageObj.username,
        userId: messageObj.userId,
        timestamp: messageObj.timestamp
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('leave_room', (data) => {
    const { roomId, user } = data;
    
    socket.leave(roomId);
    userSockets.delete(socket.id);
    
    socket.to(roomId).emit('user_left', {
      username: user.username,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    const userData = userSockets.get(socket.id);
    if (userData) {
      socket.to(userData.roomId).emit('user_left', {
        username: userData.username,
        timestamp: new Date()
      });
    }
    userSockets.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 