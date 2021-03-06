// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port 	 = process.env.PORT || 8080;

var mongoose = require('mongoose');	//Mongoose as our mongodb database
var passport = require('passport');	//To manage our authentication system
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var MongoStore   = require('connect-mongo')(session);

var configDB = require('./config/database.js'); // To use the url from our mongoLab database

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: false})); // get information from html forms
app.use(bodyParser.json()); // Get information from json files

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'csci3308courseproject',
							saveUninitialized: true,
							resave: true,
							duration: 30 * 60 * 1000,
							activeDuration: 5 * 60 * 1000,
							httpOnly: true,
							secure: true,
							ephemeral: true,
							store: new MongoStore ({mongooseConnection: mongoose.connection}),
										ttl: 2 * 24 * 60 * 60})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(__dirname, 'public'));

app.use(function(req, res, next){
	console.log("" + req.user);
	next();
});

// Routes ======================================================================

/* Will handle our authenticaion routes (Login, Signup, Logout)*/
var auth = express.Router();
require('./app/routes/auth.js')(auth, passport);
app.use('/auth', auth);

/* Will handle all other routes. (Once a user is logged in)*/
var secure = express.Router();
require('./app/routes/secure.js')(secure,passport);
app.use('/', secure);

//Start server =================================================================
app.listen(port);
console.log('Server running on port: ' + port);
