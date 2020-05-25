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


mongo.MongoClient.connect(MONGO_URI,(err, client)=>{

	var user_db = client.db('notification').collection('user')
	var notification_db = client.db('notification').collection('notification')

	var server = app.listen(process.env.PORT || 3000, ()=>{
		console.log(`Server Listening at Port ${process.env.PORT || 3000}`)
	})
})

//Default Route
app.get('/*', (req, res, next)=>{
	res.sendFile(path.join(__dirname, '/dist/notification/index.html'));
})

//Login End Point
app.post('/api/user/login', (req, res, next)=>{
    console.log("URI: ",MONGO_URI)
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
						user_name = user.name;

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

