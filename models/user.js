const mongoose = require('mongoose');
const passport = require('passport');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose'); // これが勝手にユーザ名、パスワードの情報を定義してくれる

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

userSchema.plugin(passportLocalMongoose, {
    errorMessages: {
        UserExistsError: 'そのユーザ名はすでに使われています',
        MissingPasswordError: 'パスワードを入力してくたさい。',
        AttemptTooSoonError: 'アカウントがロックされています。時間をあけて再度試してください。',
        TooManyAttemptsError: 'ログインの失敗が続いたため、アカウントをロックしました。',
        NoSaltValueStoredError: '認証ができませんでした。',
        IncorrectPasswordError: 'パスワードまたはユーザ名が間違っています。',
        IncorrectUsernameError: 'パスワードまたはユーザ名が間違っています。',
    }
});

module.exports = mongoose.model('User', userSchema);