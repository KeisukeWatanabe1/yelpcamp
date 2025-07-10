/* 
process.env.NODE_ENVはNODE_ENVという環境変数を指している
今、Node.jsがどういう環境で動いているかを表す。
本番環境の時は'production'を入れておくことが多い
よって、本番環境でない（＝開発環境）ではdotenvをrequireする。
*/
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
console.log(process.env.SECRET);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

// const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://admin:ricoh@localhost:27017/yelp-camp?authSource=admin';

mongoose.connect(dbUrl,
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('MongoDBコネクションOK!');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー');
        console.log(err);
    });

const app = express();

app.engine('ejs', ejsMate); // ejsを使うときは、ejsMateというengineを使ってね　という宣言
app.set('view engine', 'ejs'); // テンプレートエンジンとしてEJSを使うよ　という宣言
app.set('views', path.join(__dirname, 'views'));



// HTMLフォームから送られるデータを解析して、req.bodyに格納する
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(mongoSanitize({
//     replaceWith: '_',
// }));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,  // 24時間ごとにセッションを更新
    crypto: {
        secret
    }
});

store.on('error', e => {
    console.log('セッションストアエラー', e);
});

// session: ユーザとサーバ間の一時的な情報の保存領域
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
    
};
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
// passportに対してLocalStrategyっていうログイン方法を使う、認証ではUser.authenticate()という方法を使うということを宣言
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // セッションの中にユーザの情報をどう詰め込むかという定義
passport.deserializeUser(User.deserializeUser()); // セッションに入っている情報からユーザをどう作るか


app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com'
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com'
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});



// /campgroundsで始まるルートにcampgroundRoutesに定義されたルーティング（どの道URLを通ってきたかによって、どの処理をするか決める仕組み）を使う
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);



// すべてのメソッド（all）、すべてのurl（*）に対して
app.all('/{*any}', (req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = '問題が起きました';
    }
    res.status(statusCode).render('error', { err });
});

// app.listen(3000, () => {
//     console.log('ポート3000でリクエスト待受中...');
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`ポート${PORT}でリクエスト待受中...`);
});
