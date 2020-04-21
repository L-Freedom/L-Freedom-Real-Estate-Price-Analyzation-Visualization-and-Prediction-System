
/*
 * GET home page.
 */
 
 var crypto = require('crypto');
 var User = require('../models/user.js');
 var Post = require('../models/post.js');
 var path = require('path');
 
 module.exports = function(app){
	 app.get('/', function(req, res){
		 Post.get(null, function(err, posts){
			 if(err){
				 posts = [];
			 }
		 res.render('index', {
			 title:'首页',
			 posts:posts,
		 });
	 });
  });
	 
	 app.get('/reg', checkNotLogin);
	 app.get('/reg', function(req, res){
		 res.render('reg',{
			 title:'用户注册',
		 });
	 });
	 
	 app.post('/reg', checkNotLogin);
	 app.post('/reg', function(req, res){
		 if (req.body['password-repeat'] != req.body['password']){
			 req.flash('error', '两次输入的口令不一致');
			 return res.redirect('/reg');
		 }
		 var md5 = crypto.createHash('md5');
		 var password = md5.update(req.body.password).digest('base64');
		 
		 var newUser = new User({
			 name: req.body.username,
			 password: password,
		 });
		 
		 User.get(newUser.name, function(err, user){
			 if(user)
				 err = '用户名已存在';
			 if(err){
				 req.flash('error', err);
				 return res.redirect('/reg');
			 }
			 
			 newUser.save(function(err){
				 if(err){
					 req.flash('error', err);
					 return res.redirect('/reg');
				 }
				 req.session.user = newUser;
				 req.flash('success', '注册成功');
				 res.redirect('/');
			 });
		 });
	 });
	 
	 app.get('/login', checkNotLogin);
	 app.get('/login', function(req, res){
		 res.render('login',{
			 title:'用户登录',
		 });
	 });
	 
	 app.post('/login', checkNotLogin);
	 app.post('/login', function(req, res){
		 var md5 = crypto.createHash('md5');
		 var password = md5.update(req.body.password).digest('base64');
		 
		 User.get(req.body.username, function(err, user){
			 if(!user){
				 req.flash('error', '用户名不存在');
				 return res.redirect('/login');
			 }
			 if(req.body.username == 'admin' && user.password == password){
				 req.session.user = user;
			     req.flash('success','管理员登入成功');
				 return res.render('admini',{
					 title:'管理员',
				 });
			 }
			 if(user.password != password){
				 req.flash('error', '用户口令错误');
				 return res.redirect('/login');
			 }
			 req.session.user = user;
			 req.flash('success', '登录成功');
			 res.redirect('/');
		 });
	 });
	 
	 app.get('/dotmap', checkLogin);
	 app.get('/dotmap', function(req, res){
		  //res.sendfile(path.resolve(__dirname+ 'dotmap.html'));
		  //res.sendfile('dotmap.html'); //p
		  //res.sendfile(path.resolve(__dirname+ 'dotmap.html')); //p
		  //res.sendfile(path.resolve(__dirname+ './dotmap.html')); //p
		  res.sendfile(path.resolve(__dirname+ '../public/dotmap.html')); //forbidden
		 //res.render('dotmap',{
		//	 title:'点图',
		//	 layout:'maplay'
		// });
	 });
	 
	 app.get('/login', checkLogin);
	 app.get('/logout', function(req, res){
		 req.session.user = null;
		 req.flash('success', '登出成功');
		 res.redirect('/');
	 });
	 
	 app.get('/chinfo', checkLogin);
	 app.get('/chinfo', function(req, res){
		 res.render('chinfo',{
			 title:'修改信息',
		 });
	 });
	 
	 app.get('/admini', checkLogin);
	 app.get('/admini', checkAdminLogin);  //防止一般用户通过http://127.0.0.1:3000/admini登录
	 app.get('/admini', function(req, res){
		 res.render('admini',{
			 title:'管理员',
		 });
	 });
	 
	 app.post('/chinfo', checkLogin);
	 app.post('/chinfo', function(req, res){
		 if (req.body['password-repeat'] != req.body['password']){
			 req.flash('error', '两次输入的口令不一致');
			 return res.redirect('/chinfo');
		 }
		 
		 var currentUser = req.session.user;
		 var md5 = crypto.createHash('md5');
		 var md6 = crypto.createHash('md5');
		 var password = md5.update(req.body.password).digest('base64');
		 var oldpassword = md6.update(req.body.oldpassword).digest('base64');
		 
		 User.get(currentUser.name, function(err, user){
			 if(user.password != oldpassword){
				 req.flash('error', '用户口令错误');
				 return res.redirect('/chinfo');
			 }
			 
			 User.update(currentUser.name, password, function(err){
				 if(err){
					 req.flash('error', err);
					 return res.redirect('/chinfo');
				 }
				 req.flash('success', '修改成功');
				 res.redirect('/');
			 });
		 });
	 });
	 
	 app.post('/post', checkLogin);
	 app.post('/post', function(req, res){
		 var currentUser = req.session.user;
		 var post = new Post(currentUser.name, req.body.post);
		 post.save(function(err){
			 if (err){
				 req.flash('error', err);
				 return res.redirect('/');
			 }
			 req.flash('success', '发布成功');
			 //res.redirect('/u/' + currentUser.name);   //跳转到用户界面再点击均价会出现用户不存在
			 res.redirect('/');
		 });
	 });
	 
	 app.get('/u/:user', function(req, res){
		 User.get(req.params.user, function(err, user){
			 if(!user){
				 req.flash('error', '用户不存在');
				 return res.redirect('/');
			 }
			 Post.get(user.name, function(err, posts){
				 if(err){
					 req.flash('error', err);
					 return res.redirect('/');
				 }
				 res.render('user',{
					 title:user.name,
					 posts:posts,
				 });
			 });
		 });
	 });
	 
	 app.get('/getallu', function(req, res){
		User.getallu(null, function(err, users){
			if(err){
				users = [];
			}
			req.flash('queryu', '查询成功');
			res.render('admini',{
					 title:'管理员',
					 users:users,
				 });
	    });
	});
	 
	 app.post('/delu', function(req, res){

		 User.get(req.body.username, function(err, doc){
			 if(!doc)
				 err = '该用户不存在';
			 if(err){
				 req.flash('error', err);
				 return res.redirect('/admini');
			 }
			 
			 User.del(req.body.username, function(err){
				 if(err){
					 req.flash('error', err);
					 return res.redirect('/admini');
				 }
				 req.flash('success', '用户删除成功');
				 res.redirect('/admini');
			 });
		 });
	 });
	 
	 function checkLogin(req, res, next){
		 if (!req.session.user){
			 req.flash('error', '未登入');
			 return res.redirect('/login');
		 }
		 next();
	 }
	 
	 function checkNotLogin(req, res, next){
		 if (req.session.user){
			 req.flash('error', '已登录');
			 return res.redirect('/');
		 }
		 next();
	 }
	 
	 function checkAdminLogin(req, res, next){
		 if (req.session.user.name != 'admin'){
			 req.flash('error', '不是管理员');
			 return res.redirect('/');
		 }
		 next();
	 }
 }
/*
exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.user = function(req, res){
	
};

exports.post = function(req, res){
	
};

exports.reg = function(req, res){
	
};

exports.doReg = function(req, res){
	
};

exports.login = function(req, res){
	
};

exports.doLogin = function(req, res){
	
};

exports.logout = function(req, res){
	
};
*/