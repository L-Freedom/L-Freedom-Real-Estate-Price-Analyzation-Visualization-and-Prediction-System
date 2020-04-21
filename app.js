
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var util = require('util');

var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
	  secret: settings.cookieSecret,
	  store: new MongoStore({
		  //db: settings.db
		  //url: 'mongodb://localhost/microblog1'
		  url:'mongodb://'+settings.host
	  })
  }));
  app.use(express.router(routes));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.helpers({
	inspect: function(obj){
		return util.inspect(obj, true);
	}
});

app.dynamicHelpers({
	headers:function(req, res){
		return req.headers;
	},
	user: function(req, res){
		return req.session.user;
	},
	error: function(req, res){
		var err = req.flash('error');
		if(err.length)
			return err;
		else
			return null;
	},
	success: function(req, res){
		var succ = req.flash('success');
		if(succ.length)
			return succ;
		else
			return null;
	},
	queryu: function(req, res){
		var query = req.flash('queryu');
		if(query.length)
			return query;
		else
			return null;
	},
});

// Routes
/*
app.get('/', routes.index);
app.get('/u/:user', routes.user);
app.post('/post', routes.post);
app.get('/reg', routes.reg);
app.post('/reg', routes.doReg);
app.get('/login', routes.login);
app.post('/login', routes.doLogin);
app.get('/logout', routes.logout);
*/
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
