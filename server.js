var express = require('express')
var logger = require('morgan')
var mongo = require('mongodb')
var bodyParser = require('body-parser')
var session = require('express-session')

var app = express();

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
app.use('/*', (req, res, next)=>{
	res.sendFile(path.join(__dirname, '/dist/notification/index.html'));
})