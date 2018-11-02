const functions = require('firebase-functions');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();

app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);

app.use(expressLayouts);

app.get('/', function(req, res, next) {
  res.render('index', { title: '' });
})

app.get('/login', function(req, res, next) {
  res.redirect('diary/login');
});

app.get('/signup', function(req, res, next) {
  res.redirect('diary/signup');
});

app.get('/offline.html', function(req, res, next){
  res.sendFile('public/offline.html');
});

// diary.js파일을 diary라는 가상 폴더로 사용
app.use('/diary', require('./diary'));

// functions 함수를 이용해 생성한 api1을 firebase.json 설정으로 넘김
const api = functions.https.onRequest(app)
module.exports = {
  api
}