var express = require('express')
require('dotenv').config()
var bcrypt = require('bcryptjs')
var logger = require('morgan')
var mongo = require('mongodb')
var bodyParser = require('body-parser')
var session = require('express-session')
var path = require('path')
var logger = require('morgan')
var redis = require('redis')
var redisClient = redis.createClient({
	port : 12212,
	host : process.env.REDIS_URI
});
redisClient.auth(process.env.REDIS_PASSWORD);

var redisStore = require('connect-redis')(session)

var app = express();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:5000"
const REDIS_URI = process.env.REDIS_URI || "localhost"


app.use(logger('dev'));
app.use(express.static(__dirname + '/dist'));
app.use(session({
    secret: 'OmegaRanger',
    resave: true,
    saveUninitialized: true,
    name: 'notification_cache',
    cookie: { secure: false},
    store: new redisStore({ host: REDIS_URI, port: 12212, client: redisClient, ttl: 1600}),
}));

var user_socket = {}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


var user_name;


mongo.MongoClient.connect(MONGO_URI,(err, client)=>{

	var user_db = client.db('notification').collection('user')
	var notification_db = client.db('notification').collection('notification')

	var server = app.listen(process.env.PORT || 3000, ()=>{
		console.log(`Server Listening at Port ${process.env.PORT || 3000}`)
	})

    const io = require('socket.io').listen(server)

    io.on('connection', (socket)=>{

            socket.on('con', ()=>{
                socket.name = user_name;
                user_socket[user_name] = socket.id;
                console.log("USER: ",socket.name);
            })

            socket.on('check', (odata)=>{
                var id = odata._id;
                var date = new Date()
                var day = date.getDate();
                var month = date.getMonth();
                var year = date.getFullYear();
                var current_date = day + "/" + (month + 1) + "/" + year;
                var notification = {
                        user: socket.name,
                        date: current_date
                }
                console.log("ID: ",socket.name)
                console.log("noti: ", notification)

                user_db.findOne({ _id : new mongo.ObjectId(id)}, (error, user)=>{
                        console.log("USER")
                        var notify_id = user.notification;
                        notification_db.findOne({ _id : notify_id}, (errr, notify)=>{
                            if(notify == null){
                                var data = {
                                    notify : [notification]
                                }
                                console.log("DATA: ",data)
                                notification_db.insertOne(data, (er, data)=>{
                                    var Id = data.ops[0]._id;
                                    user_db.updateOne({ _id : id}, { $set: { notification : Id }}, (error1, update)=>{
                                            socket.to(user_socket[user.username]).emit('notify', notification);
                                        })
                                })
                            }else{
                                var noti = notify.notify;
                                noti.push(notification)

                                notification_db.updateOne({ _id : notify_id}, { $set: { notify : noti }}, (error1, update)=>{
                                    socket.to(user_socket[user.username]).emit('notify', notification);
                                })
                            }
                        })

                    })
                })

            socket.on('disconnect', ()=>{
                console.log("Disconnect")
            })
    })
})

//Default Route
app.get('/*', (req, res, next)=>{
	res.sendFile(path.join(__dirname, '/dist/notification/index.html'));
})


//User Public Profile
app.post('/api/profile/:id', (req, res, next)=>{
    
    var id = req.params.id + "notify";
    redisClient.get(id, (err, cache_data)=>{
        if(cache_data == null){
            mongo.MongoClient.connect(MONGO_URI, (err, client)=>{
                var user_db = client.db('notification').collection('user')

                console.log("ID: ",id);
                user_db.findOne({_id : new mongo.ObjectId(id)}, (error, user)=>{
                    if(user == null){
                        res.status(500).json({"err" : "User doesn't Exist"})
                    }
                    else{
                        res.status(200).json(user);
                    }
                })
            })        
        }
        else{

            res.status(200).json(JSON.parse(cache_data));
        }
    })
})


//Show All Notification
app.post('/api/notification', (req, res, next)=>{

    mongo.MongoClient.connect(MONGO_URI, (err, client)=>{

        var user_db = client.db('notification').collection('user')
        var notification_db = client.db('notification').collection('notification')

        user_db.findOne({ _id : req.session._id}, (error, user)=>{
            
            var noti_id = user.notification;
            
            if(noti_id == undefined){
            
                res.status(200).json({"msg" : "No Notification"})
            
            } else {
                
                notification_db.findOne({ _id : noti_id}, (error1, notification)=>{
                
                    res.status(200).json(notification.notify);
                
                })
            }
        })
    })
})


//User Profile
app.post('/api/profile', (req, res, next)=>{

    var id = req.session._id.toString();
    redisClient.get(id, (err, cache_data)=>{
        if(cache_data == null){
            mongo.MongoClient.connect(MONGO_URI, (err, client)=>{
                var user_db = client.db('notification').collection('user')

                user_db.findOne({_id : new mongo.ObjectId(req.session._id)}, (error, user)=>{
                    if(user == null){
                        res.status(500).json({"err" : "User doesn't Exist"})
                    }
                    else{
                        redisClient.setex(id, 600, JSON.stringify(user));
                        res.status(200).json(user);
                    }
                })
            })        
        }
        else{
		console.log("Cache")
            res.status(200).json(JSON.parse(cache_data));
        }
    })
    
})


//Is user already logged in
app.post('/api/islogin', (req, res, next)=>{
    if(req.session._id == null){
        res.status(200).json({"logged" : false});
    }
    else{

        res.status(200).json({"logged" : true})
    }
})


//All Users
app.post('/api/users', (req, res, next)=>{

    user_name = req.session.username;
    var id = 'users' + user_name;
    console.log("AID: ",id)
    redisClient.get(id, (err, cache_data)=>{
        if(cache_data == null){
            mongo.MongoClient.connect(MONGO_URI, (err, client)=>{

                var user_db = client.db('notification').collection('user')

                user_db.find({}).toArray((err, users)=>{

                    var data = new Array();

                    for(var i = 0; i < users.length; i++){
                        if(users[i]._id != req.session._id){
                            if(data.length == 0){
                                data = [{
                                    user: users[i].name,
                                    _id: users[i]._id
                                }]
                            }
                            else{
                                data.push({
                                    user: users[i].name,
                                    _id: users[i]._id
                                })
                            }
                        }
                    }
                    redisClient.setex(id, 600, JSON.stringify(data))
                    res.status(200).json(data);
                })
            })
        }
        else{

            res.status(200).json(JSON.parse(cache_data));
        }
    })
    
})


//Login End Point
app.post('/api/user/login', (req, res, next)=>{
 //   console.log("URI: ",MONGO_URI)
        mongo.MongoClient.connect(MONGO_URI, (err, client)=>{

            if(err)
                res.status(500).json({"err" : "Error"});
            else{

                    var user_db = client.db('notification').collection('user')
                user_db.findOne({email : req.body.email}, (error, user)=>{

                    if (user != null){
                        var isValid = bcrypt.compareSync(req.body.passwd, user.passwd);  
			   if(isValid)
                        {
                            
                            req.session.username = user.username
                            req.session._id = user._id.toString();
                            req.session.user = user.name;

                            var id = user._id.toString();

                            redisClient.setex(id, 600, JSON.stringify(user));

                            res.status(200).json({"msg" : "Login SuccessFUll"});
                        }
                        else
                            res.status(500).json({"err" : "Incorrect Password"});
                    }else
                        res.status(500).json({"err" : "Incorrect Email"});

                });
            }
        });
});


//Logout EndPoint
app.post('/api/user/logout', (req, res, next)=>{

    //console.log("ID1: ",req.session._id)
    redisClient.flushdb( function (err, succeeded) {
        console.log("SUC: ",succeeded)
        if(succeeded == "OK"){
            if(req.session._id != null){
                req.session.destroy((err) => {

                    if(err) {
                            res.status(500).json({"err" : "Error in Logout"});
                    }
                    else{

                        res.status(200).json({"msg" : "Logout Sucessfull"});
                    }
                });
            }
            else{
                res.status(200).json({"msg" : "Logout Sucessfull"});
            }
        }
        else{
            res.status(500).json({"err" : "Error in Logout"});
        }
    })
});


//Register EndPoint
app.post('/api/user/register', (req, res, next)=>{

	var hashedPasswd = bcrypt.hashSync(req.body.passwd, 8);

        var data = {
                email : req.body.email,
                passwd : hashedPasswd,
                name : req.body.name,
				mobile: req.body.mobile,
				username: req.body.username,
                notification: new mongo.ObjectId()
        };

        mongo.MongoClient.connect(MONGO_URI, (err, client)=>{

                if(err)
                        res.status(500).json({"err" : "Error"});
                else{

                        var user_db = client.db('notification').collection('user')
			user_db.insertOne(data, (error, user)=>{

                             res.status(200).json({"msg" : "User Registered"});

                        });
                }
        });
});

