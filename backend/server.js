const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes')
const { notFound, errorHandler } = require('./middileware/errorHandler')

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

// --- Routes---
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/chats', chatRoutes);
// app.use('/api/messages', messageRoutes);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        console.log(`User ${userData._id} joined their room.`);
        socket.emit('connected');
    });

    socket.on('join chat', (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
    });

    socket.on('new message', (newMessageReceived) => {
        const chat = newMessageReceived.chat;

        if (!chat.users) return console.log('chat.users not defined');

        chat.users.forEach(user => {
            if (user._id === newMessageReceived.sender._id) return;
            socket.in(user._id).emit('message received', newMessageReceived);
        });
    });

    socket.on('typing', (chatId) => socket.in(chatId).emit('typing'));
    socket.on('stop typing', (chatId) => socket.in(chatId).emit('stop typing'));


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
