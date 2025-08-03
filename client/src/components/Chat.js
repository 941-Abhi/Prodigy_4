import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const Chat = ({ user, onLogout }) => {
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [systemMessages, setSystemMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Load rooms
    loadRooms();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      // Socket event listeners
      socket.on('room_joined', (data) => {
        setMessages(data.messages);
        setUsersInRoom(data.users);
        setCurrentRoom(data.roomId);
      });

      socket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('user_joined', (data) => {
        setSystemMessages(prev => [...prev, `${data.username} joined the room`]);
        setUsersInRoom(prev => [...prev, data.username]);
      });

      socket.on('user_left', (data) => {
        setSystemMessages(prev => [...prev, `${data.username} left the room`]);
        setUsersInRoom(prev => prev.filter(username => username !== data.username));
      });
    }
  }, [socket]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const joinRoom = (roomId) => {
    if (socket && user) {
      // Leave current room if any
      if (currentRoom) {
        socket.emit('leave_room', { roomId: currentRoom, user });
      }
      
      // Join new room
      socket.emit('join_room', { roomId, user });
      setSystemMessages([]);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && currentRoom && user) {
      socket.emit('send_message', {
        roomId: currentRoom,
        message: newMessage.trim(),
        user
      });
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    try {
      // Handle different timestamp formats
      let date;
      if (typeof timestamp === 'string') {
        // If it's a string, try to parse it
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        // If it's already a Date object
        date = timestamp;
      } else {
        // If it's a number or other format
        date = new Date(timestamp);
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown time';
      }
      
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Unknown time';
    }
  };

  const handleLogout = () => {
    if (socket && currentRoom) {
      socket.emit('leave_room', { roomId: currentRoom, user });
    }
    onLogout();
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Chat Rooms</h3>
          <div className="user-info">
            Welcome, {user.username}!
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        
        <div className="rooms-list">
          {rooms.map(room => (
            <div
              key={room.id}
              className={`room-item ${currentRoom === room.id ? 'active' : ''}`}
              onClick={() => joinRoom(room.id)}
            >
              <div className="room-name">{room.name}</div>
              <div className="room-users">{room.userCount} users online</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {currentRoom ? (
          <>
            <div className="chat-header">
              <h3>{rooms.find(r => r.id === currentRoom)?.name}</h3>
              <div className="users-online">
                <span className="user-count">{usersInRoom.length} users online</span>
                <div className="online-users-list">
                  {usersInRoom.map((username, index) => (
                    <span key={index} className="online-user">
                      {username === user.username ? `${username} (You)` : username}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="messages-container">
              {systemMessages.map((msg, index) => (
                <div key={index} className="system-message">
                  {msg}
                </div>
              ))}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.userId === user.id ? 'own' : 'other'}`}
                >
                  <div className="message-content">
                    {message.text}
                  </div>
                  <div className="message-info">
                    {message.user} • {formatTime(message.timestamp)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <form onSubmit={sendMessage} className="message-input-form">
                <input
                  type="text"
                  className="message-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={!currentRoom}
                />
                <button
                  type="submit"
                  className="send-btn"
                  disabled={!newMessage.trim() || !currentRoom}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#666',
            fontSize: '18px'
          }}>
            Select a room to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 