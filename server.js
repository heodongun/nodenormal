const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

app.use(session({
  secret: '암호화에 쓸 비번',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

// 정적 파일 제공 설정
app.use(express.static('public'));

let db;
const url = 'mongodb+srv://heodongun:heodongun0922@heodongun.zpzozxd.mongodb.net/?retryWrites=true&w=majority&appName=heodongun';

new MongoClient(url).connect().then((client) => {
  console.log('DB연결성공');
  db = client.db('forum');
}).catch((err) => {
  console.log(err);
});

app.listen(8080, () => {
  console.log('http://localhost:8080 에서 서버 실행중');
});

passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username: 입력한아이디 });
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' });
  }
  if (result.password == 입력한비번) {
    return cb(null, result);
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
}));

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username });
  });
});

passport.deserializeUser(async (user, done) => {
  let result = await db.collection('user').findOne({ _id: new ObjectId(user.id) });
  delete result.password;
  process.nextTick(() => {
    return done(null, result);
  });
});

app.get('/', async (request, respond) => {
  respond.render('award.ejs', { username: request.user ? request.user.username : null, heart: request.user ? request.user.heart : null });
});

app.get('/heart', async (request, respond) => {
  heart = request.user ? request.user.heart : null;
  heart = parseInt(heart);
  respond.render('myInfo.ejs', { username: request.user ? request.user.username : null, heart: heart });
});

app.post('/login', async (request, respond, next) => {
  console.log('loginsuccess');
  passport.authenticate('local', (error, user, info) => {
    if (error) return respond.status(500).json(error);
    if (!user) return respond.status(401).json(info.message);
    request.login(user, (err) => {
      if (err) return next(err);
      respond.redirect('/');
    });
  })(request, respond, next);
});

// Logout route
app.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid'); // Cookie name may vary depending on your session configuration
      res.redirect('/');
    });
  });
});

app.get('/mission',(request,respond)=>{
  today = request.user ? request.user.today : null;
  today=parseInt(today)
  if(today==0){
    respond.render('quest.ejs', { username: request.user ? request.user.username : null });
  }
  else if(today==1){
    respond.render('complete.ejs', { username: request.user ? request.user.username : null});
  }
  else{
    respond.render('please.ejs',{ username: request.user ? request.user.username : null})
  }
})

app.post('/saveScore', async (req, res) => {
  let score = req.body.score;
  const userId = req.user._id;
  let result = await db.collection('user').findOne({ _id: new ObjectId(userId) });
  result = parseInt(result.heart);
  score = parseInt(score);
  if (score == 3) {
      result = String(result + 1);
      await db.collection('user').updateOne(
          { _id: new ObjectId(userId) },
          { $set: { heart: result, today: "1" } }
      );
  }
  res.redirect('/')
});




/*
app.get('/signup', async (request, respond) => {
  respond.render('signup.ejs');
});

app.post('/signup', async (request, respond) => {
  await db.collection('user').insertOne({ username: request.body.username, password: request.body.password,heart:"0" });
  respond.redirect('/');
});


app.post('/save',async (request,respond)=>{
  let main=request.user
  await db.collection('user').updateOne( { username : main.username }, {$set: { heart : request.body.number }})
  respond.redirect('/')
})*/