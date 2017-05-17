const uuid = require('uuid/v1');
var path = require('path');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var User = require('./models/user').User;

app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: null
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(require('./middleware/loadUser'));
app.use(express.static(path.join(__dirname, '/static')));


/*************** API v.1 ******************/
app.get('/games', function (req, res) {
    res.json(games);
});

app.get('/games/:id', function (req, res) {
    var gameId = req.params.id;
    var game = games[gameId];
    res.json(game);
});

app.post('/games/create', function (req, res) {
    var gameParams = req.body;
    var game = new Game({
        locked: !!gameParams.password,
        password: gameParams.password,
        size: gameParams.size
    });
    games[game.id] = game;
    res.json({gameId: game.id});
});

app.post('/users/login', function (req, res) {
    var username = req.body.username;
    if (User.findOne(username)) {
        res.json({message: 'This username already defined.'});
        return;
    }
    var user = new User(username);
    req.session.user = user;
    req.session.authenticated = true;
    res.json({user: user});
});

app.get('/users/logged-in', function (req, res) {
    res.json(req.session.loggedInUser);
});
/*************** END API v.1 ******************/

app.all("/*", function(req, res) {
    res.sendFile("app.html", {root: __dirname + '/static/'});
});


























function createSquareMatrix(size) {
    return crateMatrix(size, size);
}

function crateMatrix(row, col) {
    var arr = [];
    for (var r = 0; r < row; r++) {
        arr[r] = [];
        for (var c = 0; c < col; c++) {
            arr[r][c] = new Cell(r, c);
        }
    }
    return arr;
}

function Cell(row, col) {
    this.row = row;
    this.col = col;
    this.value = 'X';
}

function Player(params) {
    this.id = uuid();
    this.login = params.login;
}

Player.prototype.setIcon = function (iconPath) {
    this.iconPath = iconPath;
};

function Message(params) {
    this.player = params.player;
    this.text = params.text;
    this.date = new Date();
}

var GAME_STATUS = {
    OPEN: 'OPEN'
};

function Game(params) {
    this.id = uuid();
    this.status = GAME_STATUS.OPEN;
    this.locked = !!params.password;
    this.password = params.password;
    this.board = createSquareMatrix(params.size || 15);
    this.messages = [];
}

Game.prototype.addMessage = function (player, text) {
    this.messages.push(new Message({
        player: player,
        text: text
    }));
};

Game.prototype.setRival = function (player) {
    this.player2 = player;
};


















var games = {};

io.set('authorization', function (handshake, callback) {
    handshake.cookies = cookie.parse(handshake.headers.cookie);
    var signedSid = handshake.cookies['connect.sid'];
    var sid = cookieParser.signedCookie(signedSid, 'keyboard cat');
    var session = session.
});

io.on('connection', function (socket) {
    socket.on('games:connect', function (gameId, callback) {
        //Если игра уже заполнена игроками
        var game = games[gameId];
        if (game.clients.length >= 2) {
            callback({errorMessage: 'Game is full'});
            return;
        }
        //Присоединяемся к комнате
        socket.join(gameId);
        game.setRival();
        socket.broadcast.emit('games:createdNew', game);
        callback({gameBoard: game.board});
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});








//var waitRoom = 'wait_room';
//io.in(waitRoom).clients(function(error, clients){
//    if (error) throw error;
//    //console.log(clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
//});

// socket.on('games:getAvailable', function (data, callback) {
//     callback(games);
// });
//socket.broadcast.to(waitRoom).emit('message', {
//    userId: userId,
//});
//socket.join(waitRoom, function(){
//});