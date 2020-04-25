var DbConnection = require('../services/db.service');
const Word = require('../classes/word');
var ObjectId = require('mongodb').ObjectID;
var words;
class WordController {
    constructor() {}
    async getAll(req, res) {
        try {
            console.log('get all words');
            let db = await DbConnection.Get();
            if (words == null) {
                await db.collection(process.env.WORD_COLLECTION)
                    .find()
                    .toArray((err, result) => {
                        if (err) throw err;
                        words = result;
                        res.json(words);
                        console.log('Words are not store in session');
                    });
            } else {
                res.json(words);
            }
        } catch (e) {
            return e;
        }
    }

    async getById(req, res) {
        try {
            if (words == null) {
                let db = await DbConnection.Get();
                await db.collection(process.env.WORD_COLLECTION)
                    .findOne({
                        _id: req.params.id
                    }, (err, result) => {
                        if (err) throw err;
                        res.json(result);
                    });
            } else {
                var result = {};
                for (var i = 0; i < words.length; i++) {
                    if (words[i]._id == req.params.id) {
                        result = words[i];
                        break;
                    }
                }
                res.json(result);
            }
        } catch (e) {
            return e;
        }
    }

    async createNew(req, res) {
        try {
            let newObj = new Word(req.body);
            console.log('create new Word')
            let db = await DbConnection.Get();
            await db.collection(process.env.WORD_COLLECTION)
                .insertOne(newObj, (err, result) => {
                    if (err) {
                        return res.status(500).json(err.message);
                    }
                    res.json(result);
                    db.collection(process.env.WORD_COLLECTION).find().toArray((err, result) => {
                        words = result;
                    });
                });
        } catch (e) {
            return e;
        }
    }

    async update(req, res) {
        try {
            console.log('Update Word');
            let lstId = [];
            let bodyObj = {};
            if (req.body) {
                for (var i = 0; i < req.body.length; i++) {
                    var objId = ObjectId(req.body[i]._id);
                    lstId.push(objId);
                    bodyObj[objId] = new Word(req.body[i]);
                }
            }
            let db = await DbConnection.Get();
            let datas = await db.collection(process.env.WORD_COLLECTION).find({ _id: { $in: lstId } });
            let promises = [];
            await datas.forEach(data => {
                delete bodyObj[data._id]._id;
                promises.push(
                    db.collection(process.env.WORD_COLLECTION).updateOne(data, { $set: bodyObj[data._id] })
                );
            });
            Promise.all(promises)
                .then(() => {
                    res.status(200).json(true);
                    db.collection(process.env.WORD_COLLECTION).find().toArray((err, result) => {
                        words = result;
                    });
                })
                .catch(errs => {
                    res.status(500).json("Word.controller.update");
                })
        } catch (e) {
            return e;
        }
    }

    async deleteBulk(req, res) {
        try {
            console.log('Delete bulk records');
            let lstId = [];
            if (req.body) {
                for (var i = 0; i < req.body.length; i++) {
                    lstId.push(ObjectId(req.body[i]._id));
                }
            }
            let db = await DbConnection.Get();
            await db.collection(process.env.WORD_COLLECTION).deleteMany({ _id: { $in: lstId } }, (err) => {
                if (err)
                    res.status(500).json('Word.controller.deleteBulk');
                else
                    res.status(200).json(true);
                db.collection(process.env.WORD_COLLECTION).find().toArray((err, result) => {
                    words = result;
                });
            });
        } catch (e) {
            return e;
        }
    }
}

module.exports = WordController;