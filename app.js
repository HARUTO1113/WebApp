const express = require('express');
require('dotenv').config();
const mysql = require('mysql');
const session = require('express-session');
const bcrypt=require('bcrypt');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
// EJSをテンプレートエンジンとして設定
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req,res,next)=>{
  if (req.session.userId === undefined) {
    res.locals.username="ゲスト";
    console.log('ログインしていません');
    res.locals.isLoggedIn=false;
  } else {
    res.locals.username=req.session.username;
    console.log('ログインしています');
    res.locals.isLoggedIn=true;
  }
  next();
});




app.get("/",(req,res)=>{
  res.render("top");
});



app.get("/login",(req,res)=>{
  res.render("login");
});

app.post('/login', (req, res) => {
  const email=req.body.email;
  connection.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (error, results) => {
      console.log(error);
      if (results.length > 0) {
        const plain=req.body.password;
        const hash=results[0].password

        bcrypt.compare(plain,hash,(error,isEqual)=>{
          if (isEqual){
            req.session.userId = results[0].id;
            req.session.username=results[0].username;
            res.redirect('/');
          } else {
            res.redirect('/login');
          }
        });

       
      } else {
        res.redirect('/login');
      }
    }
  );
});


app.get("/logout",(req,res)=>{
  req.session.destroy((error)=>{
    res.redirect("/");
  });
});


app.get("/plan",(req,res)=>{
  const userId=req.session.userId;
  if (!userId) {
    // ユーザーがログインしていない場合
    res.render("plan", { items: [], userId: null });
} else {
  connection.query('SELECT * FROM user_data WHERE user_id = ?',
    [userId],
    (error,results)=>{
      res.render("plan",{items:results,userId:userId});
    });
}
});


app.post("/plan",(req,res)=>{
  const title=req.body.title;
  const text=req.body.text;
 
// 年、月、日に分割
const year = req.body.date.split('-')[0];
const month = req.body.date.split('-')[1];
const day = req.body.date.split('-')[2];

const hour=req.body.times.split(':')[0];
const minute=req.body.times.split(':')[1];

const endhour=req.body.endtimes.split(':')[0];
const endminute=req.body.endtimes.split(':')[1];

const userId=req.session.userId;
  
  connection.query(
    'INSERT INTO user_data (user_id,year, month, day, hour, minute, title, text,endhour,endminute) VALUES (?, ?, ?, ?, ?,?,?,?,?,?)',
    [userId,year,month,day,hour,minute,title,text,endhour,endminute],
    (error,results)=>{
      if (error) {
        console.error('データベースへの挿入エラー:', error);
        // エラー処理
        res.status(500).send('データベースへの挿入エラー');
    } else {
        // 成功時の処理
        res.redirect("/plan");
    }
    });
  });


  app.get("/my-data",(req,res)=>{
    const userId=req.session.userId;

    if (!userId) {
      // ユーザーがログインしていない場合
      res.render("mydata", { items: [], userId: null });
  } else {
    connection.query('SELECT * FROM user_data WHERE user_id = ?',
      [userId],
      (error,results)=>{
        res.render("mydata",{items:results,userId:userId});
      });
  }
  });

app.get("/signin",(req,res)=>{
  res.render("signin",{errors:[]});
});

app.post("/signin",(req,res,next)=>{
  const username=req.body.username;
  const email=req.body.email;
  const password=req.body.password;

  const errors=[];
  if(username===""){
    errors.push("ユーザー名が空です");
  }
  if(email===""){
    errors.push("メールアドレスが空です");
  }
  if(password===""){
    errors.push("パスワードが空です")
  }
  if(errors.length > 0){
    res.render("signin",{errors:errors});
  }else{
    next();
  }
},
(req,res,next)=>{
const email=req.body.email;
const errors=[];

connection.query(
  'SELECT * FROM users WHERE email = ?',
  [email],
  (error, results) => {
    if (results.length > 0) {
      errors.push("このメールアドレスは使われています");
      res.render("signin",{errors:errors});
    } else {
      next();
      
    }
  }
);

},
(req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt.hash(password,10,(error,hash)=>{
    connection.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hash ],
      (error, results) => {
        req.session.userId=results.insertId;
        req.session.username=username;
        res.redirect('/');
      });
  });
});



// サーバーを起動
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});





