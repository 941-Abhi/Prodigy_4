# Real-Time Chat Application

A modern real-time chat application built with Node.js, Express, Socket.io, and React. Users can create accounts, join chat rooms, and exchange messages in real-time.

## Features

- 🔐 User authentication (register/login)
- 💬 Real-time messaging using WebSocket
- 🏠 Multiple chat rooms
- 👥 User presence indicators
- 📱 Responsive design
- 🎨 Modern UI with gradient backgrounds
- 🔄 Auto-scroll to latest messages
- ⚡ System messages for user join/leave events

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - Real-time communication
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Socket.io-client** - Real-time client
- **Axios** - HTTP client
- **React Router** - Client-side routing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the project directory:
```bash
cd project
```

2. Install backend dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional):
```bash
JWT_SECRET=your-secret-key-here
PORT=5000
```

4. Start the backend server:
```bash
npm start
# or for development with auto-restart:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Register/Login**: Create a new account or login with existing credentials
2. **Join Rooms**: Select from available chat rooms (General, Random)
3. **Send Messages**: Type your message and press Enter or click Send
4. **Real-time Updates**: See messages appear instantly for all users in the room
5. **User Presence**: See when users join or leave the room
6. **Logout**: Click the logout button to sign out

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Chat Rooms
- `GET /api/rooms` - Get all available rooms
- `GET /api/rooms/:roomId/messages` - Get room messages

### WebSocket Events
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message to the room
- `new_message` - Receive new message
- `user_joined` - User joined the room
- `user_left` - User left the room

## Project Structure

```
project/
├── server.js              # Main server file
├── package.json           # Backend dependencies
├── README.md             # This file
└── client/               # React frontend
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   └── Chat.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Features in Detail

### Authentication
- Secure password hashing with bcrypt
- JWT token-based authentication
- Form validation and error handling
- Persistent login state

### Real-time Messaging
- Instant message delivery using Socket.io
- Message history for each room
- Auto-scroll to latest messages
- Message timestamps

### Chat Rooms
- Pre-configured rooms (General, Random)
- User count display
- Room switching functionality
- System messages for user events

### UI/UX
- Modern gradient design
- Responsive layout for mobile devices
- Smooth animations and transitions
- Intuitive navigation

## Development

### Running in Development Mode
```bash
# Terminal 1 - Backend
cd project
npm run dev

# Terminal 2 - Frontend
cd project/client
npm start
```

### Building for Production
```bash
# Build the React app
cd project/client
npm run build

# The built files will be in client/build/
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Secure headers

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- File sharing capabilities
- Private messaging
- Message reactions
- User profiles and avatars
- Message search functionality
- Push notifications
- Voice/video chat integration

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in server.js or kill the process using the port
2. **Socket connection failed**: Ensure the backend is running on port 5000
3. **CORS errors**: Check that the frontend is running on port 3000

### Debug Mode
Enable debug logging by setting the environment variable:
```bash
DEBUG=socket.io:*
```

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Happy chatting! 🚀 