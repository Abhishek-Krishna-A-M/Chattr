const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes')
const { notFound, errorHandler } = require('./middleware/errorHandler')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')
const helmet = require('helmet')

dotenv.config();

connectDB();

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

// --- Routes---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Initial setup: User joins their own room
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        console.log(`User ${userData.name} (${userData._id}) joined their personal room.`);
        socket.emit('connected');
    });

    // User joins a specific chat room (for messages)
    socket.on('join chat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat: ${chatId}`);
    });

    // New message handling (already there)
    socket.on('new message', (newMessageReceived) => {
        const chat = newMessageReceived.chat;
        if (!chat || !chat.users) {
            return console.log('Chat or chat.users not defined for new message');
        }

        chat.users.forEach(user => {
            if (user._id === newMessageReceived.sender._id) return;
            // Emit to the individual user's room
            io.to(user._id).emit('message received', newMessageReceived);
        });
    });

    socket.on('typing', (chatId) => socket.in(chatId).emit('typing'));
    socket.on('stop typing', (chatId) => socket.in(chatId).emit('stop typing'));

    // --- WebRTC Signaling Events ---

    // When a user initiates a call, they send an offer
    socket.on('callUser', ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit('callComing', { signal: signalData, from, name });
        console.log(`Call initiated from ${name} (${from}) to ${userToCall}`);
    });

    // When a user accepts a call, they send an answer
    socket.on('answerCall', (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
        console.log(`Call answered by ${socket.id} to ${data.to}`);
    });

    // When a user sends an ICE candidate
    socket.on('sendIceCandidate', ({ targetUser, candidate }) => {
        io.to(targetUser).emit('receiveIceCandidate', candidate);
        console.log(`ICE candidate sent from ${socket.id} to ${targetUser}`);
    });

    // When a user ends a call
    socket.on('endCall', ({ to }) => {
        io.to(to).emit('callEnded');
        console.log(`Call ended by ${socket.id} for ${to}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Clean up any ongoing calls related to this socket if necessary
        // In a real app, you might want to notify partners of disconnected calls
        socket.broadcast.emit('callEnded'); // Simple broad-end call for testing
    });

    socket.off('setup', () => {
        console.log('User disconnected from setup');
        socket.leave(userData._id);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
