const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const {  v4:uuidv4} = require('uuid');

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server,{
    debug:true
});


const cookieSession = require('cookie-session');
const { nextTick } = require('process')
const passport = require('passport')
require('./passport-setup');

let USER_LIST = [];

//middleware
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))


app.set('view engine','ejs');

app.use(express.static('public'));

app.use('/peerjs',peerServer);
app.use(passport.initialize());
app.use(passport.session());

var ROOM_ID;

app.get('/',(req,res)=>{
    ROOM_ID = uuidv4();
    if(req.user)
    {
    res.redirect(`/${ROOM_ID}`);
    }
    else {
        res.redirect('/auth/google')
    }
})

//logging out and destroying the session
app.get('/logout', (req, res) => {
    req.logout();
    req.session = null;
    res.send('<h3>Left the meeting</h3><br><a href="/">Start a new meeting</a>');
})

app.get('/:room',(req,res)=>{
    ROOM_ID = req.params.room;
    if(req.user)
    {
    res.render('room',{roomId:ROOM_ID});
    }
    else {
        res.redirect('/auth/google')
    }
})

app.get('/',(req,res)=>{
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room});
})

io.on('connection',socket =>{
    socket.on('join-room',(roomId,userId)=>{
        socket.join(roomId);
        socket.to(roomId).emit('user-connected',userId);
        socket.on('message',message =>{
            io.to(roomId).emit('createMessage',message);
 
})
})
})

//google authentication

app.get('/auth/google/failure', (req, res) => {
    res.send('Could Not Login, Try Again...');
})

app.get('/auth/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile'],
        prompt: 'select_account' //to allow user to select a different account once logged out
    }
    ));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: (ROOM_ID) ? `/${ROOM_ID}` : '/',
        failureRedirect: '/auth/google/failure'
    }));

server.listen(process.env.PORT||3000);