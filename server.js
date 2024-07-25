const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const session = require('express-session');
const passport = require('passport');
const { mongoURI } = require('./dev');
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
const url = mongoURI;

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

