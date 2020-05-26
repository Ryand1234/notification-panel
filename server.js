var express = require('express')
require('dotenv').config()
var bcrypt = require('bcryptjs')
var logger = require('morgan')
var mongo = require('mongodb')
var bodyParser = require('body-parser')
var session = require('express-session')
var path = require('path')
var logger = require('morgan')

var app = express();

app.use(logger('dev'));
app.use(express.static(__dirname + '/dist'));
app.use(session({secret:'ChatApp', resave:true, saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:5000"

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
                user[user_name] = socket.id;
            })

            socket.on('check', (data)=>{
                var id = data._id;
                var date = new Date()
                var date = date.getDate();
                var month = date.getMonth();
                var year = date.getFullYear();
                var current_date = date + "/" + (month + 1) + "/" + year;
                var notification = {
                        user: socket.name,
                        date: current_date
                }

                user_db.findOne({ _id : new mongo.ObjectId(id)}, (error, user)=>{
                        var notify = user.notification;
                        if(notify.length == 0){
                            notify = [notification]
                        }
                        else{
                            notify.push(notification)
                        }

                        user_db.updateOne({ _id : new mongo.ObjectId(id)}, { $set: { notify : notify }}, (error1, update)=>{
                                socket.to(user[user.username]).emit('notify', notification);
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


//All Users
app.get('/api/users', (req, res, next)=>{

    mongo.MongoClient.connect(MONGO_URI, (err, client)=>{

        var user_db = client.db('notification').collection('user')

        user_db.find({}).toArray((err, users)=>{

            var data = new Array();

            for(var i = 0; i < users.length; i++){
                if(user[i]._id != req.session._id){
                    if(data.length == 0){
                        data = [{
                            user: user[i].name,
                            _id: user[i]._id
                        }]
                    }
                    else{
                        data.push({
                            user: user[i].name,
                            _id: user[i]._id
                        })
                    }
                }
            }
            res.status(200).json(data);
        })
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
						user_name = user.username;

						req.session._id = user._id;
						req.session.user = user.name;
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

	req.session.destroy((err) => {

                if(err) {
                        res.status(500).json({"err" : "Error in Logout"});
                }
                else{
	
			res.status(200).json({"msg" : "Logout Sucessfull"});
		}
        });

});


//Register EndPoint
app.post('/api/user/register', (req, res, next)=>{

	var hashedPasswd = bcrypt.hashSync(req.body.passwd, 8);
	console.log("Hashed Password: ",hashedPasswd);
        var data = {
                email : req.body.email,
                passwd : hashedPasswd,
                name : req.body.name,
				mobile: req.body.mobile,
				username: req.body.username,
                notification: new Array()
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

