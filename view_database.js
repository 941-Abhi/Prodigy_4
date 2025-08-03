const { dbOperations } = require('./database');

async function viewDatabase() {
  try {
    console.log('=== DATABASE CONTENTS ===\n');
    
    // View all users
    console.log('📋 USERS:');
    const users = await dbOperations.getAllUsers();
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    }
    
    // View all messages
    console.log('💬 MESSAGES:');
    const messages = await dbOperations.getAllMessages();
    if (messages.length === 0) {
      console.log('No messages found');
    } else {
      messages.forEach((message, index) => {
        console.log(`${index + 1}. Room: ${message.room_name}`);
        console.log(`   Sender: ${message.sender_name}`);
        console.log(`   Message: ${message.message}`);
        console.log(`   Time: ${message.timestamp || message.created_at || 'Unknown time'}`);
        console.log('');
      });
    }
    
    // View rooms
    console.log('🏠 CHAT ROOMS:');
    const rooms = await dbOperations.getRooms();
    rooms.forEach((room, index) => {
      console.log(`${index + 1}. ID: ${room.id}`);
      console.log(`   Name: ${room.name}`);
      console.log(`   Created: ${room.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error viewing database:', error);
  }
}

viewDatabase(); 