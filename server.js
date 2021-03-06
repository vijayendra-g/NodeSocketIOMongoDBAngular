var http = require('http');
var express = require('express');
var path = require('path');
var app = express();
var server = http.createServer(app);
var databaseUrl = 'sampledb';
var collections = ['things'];
var db = require('mongojs').connect(databaseUrl, collections);
var mongojs = require('mongojs');
var io = require('socket.io').listen(server);

// config
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    app.set('views', __dirname + '/views');
    app.engine('html', require('ejs').renderFile);
});

// routing
app.get('/', function(req, res){
    res.render('home.html');
});

// socket.io service
io.sockets.on('connection', function(socket){
    //get
    socket.on('getUsers', function(){
        db.things.find('', function(err, users){
            if(err){
                console.log(err);
            }
            else{
                getUsers();
            }
        });
    });
    function getUsers(){
        db.things.find('', function(err, users){
            if(err){
                console.log(err);
            }
            else{
                socket.emit('getUsers', users);
            }
        });
    }
    //insert
    socket.on('insertUser', function(data){
        db.things.save({username: data.username, password: data.password, email: data.email}, function(err, saved){
            if(err){
                console.log(err);
            }
            else{
                getUsers();
            }
        });
    });
    //update
    socket.on('updateUser', function(data){
        var ObjectId = mongojs.ObjectId;
        db.things.update({_id: ObjectId(data._id)}, {username: data.username, password: data.password, email:data.email}, function(err, saved){
            if(err){
                console.log(err);
            }
            else{
                getUsers();
            }
        });
    });
    //remove
    socket.on('removeUser', function(data){
        db.things.remove(data, function(err, saved){
            if(err){
                console.log(err);
            }
            else{
                getUsers();
            }
        });
    });
});

server.listen(9000);
