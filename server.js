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
    var gameId = req.params.id;
    res.json(new GameDto(games[gameId]));
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
    User.findById(req.session.userId).then(function (user) {
        user = user || {};
        res.json({
            id: user.id,
            username: user.username
        });
    });
});
/*************** END API v.1 ******************/

app.get("/*", function (req, res) {
    res.sendFile("app.html", {root: path.join(__dirname, config.static)});
});





function GameDto(game) {
    this.id = game.id;
    this.owner = game.owner.username;
    this.size = game.size;
    this.locked = game.locked;
    this.board = game.board;
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

function Cell(row, col) {
    this.row = row;
    this.col = col;
    this.value = '';
}

function Player(user) {
    this.id = user.id;
    this.user = user;
    this.symbol = null;
    this.game = null;
    this.rival = null;
}

Player.prototype.setRival = function (rival) {
    this.rival = rival;
};

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
    this.owner = params.owner;
    this.status = GAME_STATUS.OPEN;
    this.locked = !!params.password;
    this.password = params.password;
    this.board = createSquareMatrix(params.size || 15);
    this.symbols = ['X', 'O'].sort(function randomSort() {
        return Math.random() - 0.5;
    });
    this.players = {};
    this.nextTurn = null;
    this.messages = [];
}

Game.prototype.turn = function (playerId, row, col) {
    var cell = this.board[row][col];
    var player = this.players[playerId];
    if (player !== this.nextTurn || cell.value) {
        return false;
    }
    cell.value = player.symbol;
    this.nextTurn = player.rival;
    return true;
};

Game.prototype.addMessage = function (player, text) {
    this.messages.push(new Message({
        player: player,
        text: text
    }));
};

Game.prototype.addPlayer = function (player) {
    player.game = this;
    player.symbol = this.symbols.pop();
    this.players[player.id] = player;
};

Game.prototype.changeStatus = function (status) {
    this.status = status;
};

Game.prototype.setRivalReferences = function () {
    var players = [];
    for (var key in this.players) {
        players.push(this.players[key]);
    }
    //TODO add asserts length 2
    var player1 = players[0];
    var player2 = players[1];
    player1.setRival(player2);
    player2.setRival(player1);
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
            }
            handshake.session = session;
            loadUser(session.userId, callback);
        },
        function (user, callback) {
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

    socket.on('games:create', function (params, callback) {
        var game = new Game({
            owner: user,
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
        game.addPlayer(new Player(user));
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