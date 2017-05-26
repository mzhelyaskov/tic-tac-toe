const uuid = require('uuid/v1');
var async = require('async');
var path = require('path');
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
app.use(express.static(path.join(__dirname, '/static')));


/*************** API v.1 ******************/
app.get('/api/games', function (req, res) {
    var openGames = [];
    for (var gameId in games) {
        if (!games.hasOwnProperty(gameId)) continue;
        openGames.push(games[gameId]);
    }
    res.json(openGames);
});

app.get('/api/games/:id', function (req, res) {
    var gameId = req.params.id;
    var game = games[gameId];
    res.json(game);
});

app.post('/api/games/create', function (req, res) {
    var gameParams = req.body;
    var game = new Game({
        locked: !!gameParams.password,
        password: gameParams.password,
        size: gameParams.size
    });
    games[game.id] = game;
    res.json({gameId: game.id});
});

app.post('/api/users/login', function (req, res, next) {
    User.authorize(req.body.username, function (err, user) {
        if (err) {
            if (typeof err === 'string') {
                res.json({message: err});
            } else {
                next(err);
            }
            return;
        }
        req.session.userId = user.id;
        req.session.authenticated = true;
        res.json({user: user});
    });
});

app.get('/api/users/logged-in', function (req, res) {
    loadUser(req.session.userId, function (err, user) {
        res.json({
            id: user.id,
            username: user.username
        });
    });
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
    this.value = '';
}

function Player(user, symbol) {
    this.id = user.id;
    this.login = user.username;
    this.symbol = symbol;
}

function Message(params) {
    this.player = params.player;
    this.text = params.text;
    this.date = new Date();
}

var GAME_STATUS = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED'
};

function Game(params) {
    this.id = uuid();
    this.x = 'X';
    this.o = 'O';
    this.status = GAME_STATUS.OPEN;
    this.locked = !!params.password;
    this.password = params.password;
    this.board = createSquareMatrix(params.size || 15);
    this.nextTurn = this.x;
    this.players = [];
    this.messages = [];
}

Game.prototype.changeTurn = function () {
    this.nextTurn = this.nextTurn === this.x ? this.o : this.x;
};

Game.prototype.isAllPlayerExists = function () {
    return this.players.length >= 2;
};

Game.prototype.addMessage = function (player, text) {
    this.messages.push(new Message({
        player: player,
        text: text
    }));
};

Game.prototype.addPlayer = function (player) {
    this.players.push(player);
};

Game.prototype.changeStatus = function (status) {
    this.status = status;
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

io.use(function(socket, next) {
    var handshake = socket.handshake;
    async.waterfall([
        function(callback) {
            handshake.cookies = cookie.parse(socket.request.headers.cookie);
            var signedSid = handshake.cookies['connect.sid'];
            var sid = cookieParser.signedCookie(signedSid, 'keyboard cat');
            loadSession(sid, callback);
        },
        function(session, callback) {
            if (!session) {
                callback(new Error('There are no session'));
            }
            handshake.session = session;
            loadUser(session.userId, callback);
        },
        function(user, callback) {
            if (!user) {
                callback(new Error('There are no user'));
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

    socket.on('games:connect', function (gameId, callback) {
        var game = games[gameId];
        if (!game) {
            throw new Error('Game undefined');
        }
        if (game.status === GAME_STATUS.CLOSED) {
            throw new Error('Game is full');
        }
        game.addPlayer(new Player(user, game.nextTurn));
        game.changeTurn();
        socket.join(gameId);
        if (game.isAllPlayerExists()) {
            game.changeStatus(GAME_STATUS.CLOSED);
        }
        if (game.players.length === 1) {
            socket.broadcast.emit('games:createdNew', game);
        }
        callback({gameBoard: game.board});
    });

    socket.on('games:turn', function (data, callback) {
        var game = games[data.gameId];
        var cell = game.board[data.cell.row][data.cell.col];
        cell.value = game.nextTurn;
        game.changeTurn();
        callback({gameBoard: game.board});
        socket.broadcast.to(data.gameId).emit('games:turn', {gameBoard: game.board});
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