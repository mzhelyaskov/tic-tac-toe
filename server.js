const uuid = require('uuid/v1');
var async = require('async');
var path = require('path');
var numberUtils = require('./utils/numberUtils');
var express = require('express');
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var bodyParser = require('body-parser');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sequelize = require('./models').sequelize;
var User = require('./models').User;
var Session = require('./models').Session;
var config = require('./config');

console.log('static path: ' + path.join(__dirname, config.static));

var sessionStore = new SequelizeStore({
    db: sequelize,
    table: 'Session',
    extendDefaultFields: function (defaults, session) {
        return {
            data: defaults.data,
            expires: defaults.expires,
            userId: session.userId
        };
    }
});

app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: null
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(require('./middleware/loadUser'));
app.use(express.static(path.join(__dirname, config.static)));

/*************** API v.1 ******************/
app.get('/api/games', function (req, res) {
    var openGames = [];
    for (var gameId in games) {
        if (!games.hasOwnProperty(gameId)) continue;
        openGames.push(new GameDto(games[gameId]));
    }
    res.json(openGames);
});

app.get('/api/games/:id', function (req, res) {
    var game = games[req.params.id];
    if (game) {
        res.json(new GameDto(game));
    } else {
        res.json();
    }
});

app.post('/api/users/login', function (req, res, next) {
    User.authorize(req.body.username, function (err, user) {
        if (err) {
            if (typeof err === 'string') {
                res.json({
                    success: false,
                    message: err
                });
            } else {
                next(err);
            }
            return;
        }
        req.session.userId = user.id;
        req.session.authenticated = true;
        res.json({
            success: true,
            user: new UserDto(user)
        });
    });
});

app.post('/api/users/logout', function (req, res, next) {
    //TODO очистить все игры связанные с юзером
    req.session.destroy();
    res.end();
});

app.get('/api/users/logged-in', function (req, res) {
    User.findById(req.session.userId).then(function (user) {
        res.json(new UserDto(user || {}));
    });
});
/*************** END API v.1 ******************/

app.get("/*", function (req, res) {
    res.sendFile("app.html", {root: path.join(__dirname, config.static)});
});



function UserDto(user) {
    this.id = user.id;
    this.username = user.username;
}

function GameDto(game) {
    this.id = game.id;
    this.owner = game.owner;
    this.size = game.size;
    this.locked = game.locked;
    this.board = game.board;
    this.chat = game.chat;
}

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

function getCurrentTime() {
    var date = new Date();
    var hours = ('00' + date.getHours()).slice(-2);
    var seconds = ('00' + date.getSeconds()).slice(-2);
    return hours + ':' + seconds;
}

function Cell(row, col) {
    this.row = row;
    this.col = col;
    this.value = '';
}

function Player(user) {
    this.id = user.id;
    this.symbol = null;
    this.rivalId = null;
}

function MessageContainer(username) {
    this.sender = username;
    this.messages = [];
}

function Message(text) {
    this.text = text;
    this.time = getCurrentTime();
}

var GAME_STATUS = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED'
};

function Game(params) {
    this.id = uuid();
    this.owner = params.owner;
    this.status = GAME_STATUS.OPEN;
    this.locked = !!params.password;
    this.password = params.password;
    this.size = params.size;
    this.board = createSquareMatrix(params.size || 15);
    this.symbols = ['X', 'O'].sort(function randomSort() {
        return Math.random() - 0.5;
    });
    this.players = [];
    this.nextTurn = null;
    this.chat = [];
}

Game.prototype.turn = function (playerId, row, col) {
    var cell = this.board[row][col];
    var gamers = this.getPlayerAndRival(playerId);
    var player = gamers.player;
    var rival = gamers.rival;
    if (player !== this.nextTurn || cell.value) {
        return false;
    }
    cell.value = player.symbol;
    this.nextTurn = rival;
    return true;
};

Game.prototype.getPlayerAndRival = function (playerId) {
    var result = {};
    this.players.forEach(function (player) {
        var key = player.id === playerId ? 'player' : 'rival';
        result[key] = player;
    });
    return result;
};

function getOrCreateMessageContainer(chat, username) {
    var container = chat[chat.length - 1];
    if (container && container.sender === username) {
        return container;
    }
    container = new MessageContainer(username);
    chat.push(container);
    return container;
}

Game.prototype.addMessage = function (username, message) {
    var container = getOrCreateMessageContainer(this.chat, username);
    container.messages.push(message);
};

Game.prototype.getPlayer = function (playerId) {
    return this.players.find(function (player) {
        return player.id === playerId;
    });
};

Game.prototype.addPlayer = function (player) {
    player.game = this;
    player.symbol = this.symbols.pop();
    this.players.push(player);
};

Game.prototype.changeStatus = function (status) {
    this.status = status;
};

Game.prototype.setRivalReferences = function () {
    var player1 = this.players[0];
    var player2 = this.players[1];
    player1.rivalId = player2.id;
    player2.rivalId = player1.id;
};












var games = {};

function loadUser(userId, callback) {
    User.findById(userId).then(function (user) {
        if (!user) {
            return callback(null, null);
        }
        callback(null, user);
    });
}

function loadSession(sid, callback) {
    Session.findOne({where: {sid: sid}}).then(function (session) {
        if (!session) {
            return callback(null, null);
        }
        return callback(null, session);
    });
}

io.use(function (socket, next) {
    var handshake = socket.handshake;
    async.waterfall([
        function (callback) {
            handshake.cookies = cookie.parse(socket.request.headers.cookie);
            var signedSid = handshake.cookies['connect.sid'];
            var sid = cookieParser.signedCookie(signedSid, 'keyboard cat');
            loadSession(sid, callback);
        },
        function (session, callback) {
            if (!session) {
                callback(new Error('There are no session'));
                return;
            }
            handshake.session = session;
            loadUser(session.userId, callback);
        },
        function (user, callback) {
            if (!user) {
                callback(new Error('There are no user'));
                return;
            }
            handshake.user = user;
            callback(null);
        }
    ], function (err) {
        if (!err) {
            return next(null, true);
        }
        next();
    });
});

io.on('connection', function (socket) {
    var user = socket.handshake.user;

    socket.on('games:create', function (params, callback) {
        var game = new Game({
            owner: user.username,
            locked: !!params.password,
            password: params.password,
            size: params.size
        });
        var player = new Player(user);
        game.addPlayer(player);
        game.nextTurn = player;
        games[game.id] = game;
        socket.join(game.id);
        socket.broadcast.emit('games:createdNew', new GameDto(game));
        callback();
    });

    socket.on('games:connect', function (gameId, callback) {
        var game = games[gameId];
        if (!game) {
            callback({message: "There are no game with this ID: " + gameId});
            return;
        }
        if (game.status === GAME_STATUS.CLOSED) {
            callback({message: 'Game already is full'});
            return;
        }
        var player = new Player(user);
        game.addPlayer(player);
        game.setRivalReferences();
        socket.join(gameId);
        game.changeStatus(GAME_STATUS.CLOSED);
        io.sockets.in(game.id).emit('games:start', {gameId: game.id});
    });

    socket.on('games:turn', function (data, callback) {
        var game = games[data.gameId];
        if (game.turn(data.playerId, data.row, data.col)) {
            socket.broadcast.to(game.id).emit('games:turn', {board: game.board});
            callback({board: game.board});
        }
    });

    socket.on('chat:message', function (data, callback) {
        var game = games[data.gameId];
        var message = new Message(data.text);
        game.addMessage(user.username, message);
        socket.broadcast.to(game.id).emit('chat:message', game.chat);
        callback(game.chat);
    });
});

var port = process.env.PORT || 5000;
http.listen(port, function () {
    console.log('listening on port: ' + port);
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