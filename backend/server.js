const express = require('express');
const chats = require('./data/data')
const dotenv = require('dotenv');
const connectDb = require('./config/db');
const colors = require('colors');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const {notFound, errorHandler} = require('./middleware/errorMiddleware');

dotenv.config();

connectDb();
const app = express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("API is Running");
})

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message',messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server started on localhost:${process.env.PORT}`.yellow.bold));

const io = require('socket.io')(server,{
    pingTimeout: 60000,
    cors:{
        origin:"http://localhost:3000"
    }
});

io.on("connection", (socket)=>{
    console.log("Connected to socket.io");
    socket.on('setup',(userData)=>{
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit('connected');
    });

    socket.on('join chat',(room)=>{
        socket.join(room);
        console.log("User joined room: ", room);
    });

    socket.on('typing',(room)=>socket.in(room).emit("typing"));
    socket.on('stop typing',(room)=>socket.in(room).emit("stop typing"));

    socket.on('new message', (newMessageRecieved)=>{
        var chat = newMessageRecieved.chat;
        if(!chat.users) return

        chat.users.forEach(user=>{
            if(user._id == newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageRecieved);
        })
    });

    socket.off('setup',()=>{
        console.log('User Disconnected');
        socket.leave(userData._id);
    });
});
