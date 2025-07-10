const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://admin:ricoh@localhost:27017/yelp-camp?authSource=admin',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => {
        console.log('MongoDBコネクションOK!');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー');
        console.log(err);
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 2000) + 1000;
        // Mongooseモデル (Campground) のインスタンス（= MongoDBに保存される1つのドキュメント）を作成
        // このとき、_idが自動で生成される
        const camp = new Campground({
            author: '6866027e43543d4620016dd0',
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
            title: `${sample(descriptors)}-${sample(places)}`,
            description: '木曾路はすべて山の中である。あるところは岨づたいに行く崖の道であり、あるところは数十間の深さに臨む木曾川の岸であり、あるところは山の尾をめぐる谷の入り口である。一筋の街道はこの深い森林地帯を貫いていた。東ざかいの桜沢から、西の十曲峠まで、木曾十一宿はこの街道に添うて、二十二里余にわたる長い谿谷の間に散在していた。道路の位置も幾たびか改まったもので、古道はいつのまにか深い山間に埋もれた。',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dxr0isbuw/image/upload/v1751851040/YelpCamp/lwknnmamo2zykruklpyx.png',
                    filename: 'YelpCamp/lwknnmamo2zykruklpyx'
                },
                {
                    url: 'https://res.cloudinary.com/dxr0isbuw/image/upload/v1751851041/YelpCamp/nuif9fz7kpyfbfy9r9ou.png',
                    filename: 'YelpCamp/nuif9fz7kpyfbfy9r9ou'
                },
                {
                    url: 'https://res.cloudinary.com/dxr0isbuw/image/upload/v1751851041/YelpCamp/mn0kmgj0pfe9gdhten75.png',
                    filename: 'YelpCamp/mn0kmgj0pfe9gdhten75'
                }
            ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});