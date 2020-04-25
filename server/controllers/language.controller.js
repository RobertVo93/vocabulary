var DbConnection = require('../services/db.service');
const Language = require('../classes/language');
var ObjectId = require('mongodb').ObjectID;
var languages;
class LanguageController {
    constructor() {}
    async getAll(req, res) {
        try {
            let db = await DbConnection.Get();
            if (languages == null) {
                languages = await db.collection(process.env.LANGUAGE_COLLECTION)
                    .find()
                    .toArray((err, result) => {
                        if (err) throw err;
                        languages = result;
                        res.json(result);
                        console.log('languages are not store in session');
                    });
            } else {
                res.json(languages);
            }

        } catch (e) {
            return e;
        }
    }

    async getById(req, res) {
        try {
            if (languages == null) {
                let db = await DbConnection.Get();
                await db.collection(process.env.LANGUAGE_COLLECTION)
                    .findOne({
                        _id: req.params.id
                    }, (err, result) => {
                        if (err) throw err;
                        res.json(result);
                    });
            } else {
                var result = {};
                for (var i = 0; i < languages.length; i++) {
                    if (languages[i]._id == req.params.id) {
                        result = languages[i];
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
            let newObj = new Language(req.body);
            let db = await DbConnection.Get();
            await db.collection(process.env.LANGUAGE_COLLECTION)
                .insertOne(newObj, (err, result) => {
                    if (err) throw err;
                    res.json(result);
                    db.collection(process.env.LANGUAGE_COLLECTION).find().toArray((err, result) => {
                        languages = result;
                    });
                });
        } catch (e) {
            return e;
        }
    }

    async update(req, res) {
        try {
            let lstId = [];
            let bodyObj = {};
            if (req.body) {
                for (var i = 0; i < req.body.length; i++) {
                    var objId = ObjectId(req.body[i]._id);
                    lstId.push(objId);
                    bodyObj[objId] = new Language(req.body[i]);
                }
            }
            let db = await DbConnection.Get();
            let datas = await db.collection(process.env.LANGUAGE_COLLECTION).find({ _id: { $in: lstId } });
            let promises = [];
            await datas.forEach(data => {
                delete bodyObj[data._id]._id;
                promises.push(
                    db.collection(process.env.LANGUAGE_COLLECTION).updateOne(data, { $set: bodyObj[data._id] })
                );
            });
            Promise.all(promises)
                .then(() => {
                    res.status(200).json(true);
                    db.collection(process.env.LANGUAGE_COLLECTION).find().toArray((err, result) => {
                        languages = result;
                    });
                })
                .catch(errs => {
                    res.status(500).json("language.controller.update");
                })
        } catch (e) {
            return e;
        }
    }

    async deleteBulk(req, res) {
        try {
            let lstId = [];
            if (req.body) {
                for (var i = 0; i < req.body.length; i++) {
                    lstId.push(ObjectId(req.body[i]._id));
                }
            }
            let db = await DbConnection.Get();
            await db.collection(process.env.LANGUAGE_COLLECTION).deleteMany({ _id: { $in: lstId } }, (err) => {
                if (err)
                    res.status(500).json('language.controller.deleteBulk');
                else
                    res.status(200).json(true);
                db.collection(process.env.LANGUAGE_COLLECTION).find().toArray((err, result) => {
                    languages = result;
                });
            });
        } catch (e) {
            return e;
        }
    }
}

module.exports = LanguageController;