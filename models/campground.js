const mongoose = require('mongoose');
const Review = require('./review');
const { Schema } = mongoose;

const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

// Schema（データの構造）を定義
const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

campgroundSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

// Mongooseのモデル（MongoDBのコレクションに対応するJSオブジェクト）を作成
// このモデルを通して、データ検索、新しいデータの保存、更新・削除ができる
// Campgroundはモデル名、これの複数形campgroundsがMongoDBでのコレクション名となる
module.exports = mongoose.model('Campground', campgroundSchema);