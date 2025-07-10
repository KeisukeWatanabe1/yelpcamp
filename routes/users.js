const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const { storeReturnTo } = require('../middleware');

router.route('/register')
    .get(users.renderRegister)
    .post(users.register);

// .postについて：ここのミドルウェアで認証ができる。認証がOKなら最後のコールバックが呼ばれる
router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

module.exports = router;