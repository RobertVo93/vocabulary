var DbConnection = require('../services/db.service');
const Tag = require('../classes/tag');
var ObjectId = require('mongodb').ObjectID;
var tags;
class TagController {
    constructor() {}
    async getAll(req, res) {
        try {
            console.log('get all tags');
            let db = await DbConnection.Get();
            if (tags == null) {
                await db.collection(process.env.TAGS_COLLECTION)
                    .find()
                    .toArray((err, result) => {
                        if (err) throw err;
                        tags = result;
                        res.json(tags);
                        console.log('Tags are not store in session');
                    });
            } else {
                res.json(tags);
            }
        } catch (e) {
            return e;
        }
    }

    async getById(req, res) {
        try {
            console.log(`Get tag by ID = ${req.params.id}`);
            if (tags == null) {
                let db = await DbConnection.Get();
                await db.collection(process.env.TAGS_COLLECTION)
                    .findOne({
                        _id: req.params.id
                    }, (err, result) => {
                        if (err) throw err;
                        res.json(result);
                    });
            } else {
                var result = {};
                for (var i = 0; i < tags.length; i++) {
                    if (tags[i]._id == req.params.id) {
                        result = tags[i];
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
            console.log('create new tag');
            let newObj = new Tag(req.body);
            let db = await DbConnection.Get();
            await db.collection(process.env.TAGS_COLLECTION)
                .insertOne(newObj, (err, result) => {
                    if (err) throw err;
                    res.json(result);
                    db.collection(process.env.TAGS_COLLECTION).find().toArray((err, result) => {
                        tags = result;
                    });
                });
        } catch (e) {
            return e;
        }
    }

    async update(req, res) {
        try {
            console.log('Update tag');
            let lstId = [];
            let bodyObj = {};
            if (req.body) {
                for (var i = 0; i < req.body.length; i++) {
                    var objId = ObjectId(req.body[i]._id);
                    lstId.push(objId);
                    bodyObj[objId] = req.body[i];
                }
            }
            let db = await DbConnection.Get();
            let datas = await db.collection(process.env.TAGS_COLLECTION).find({ _id: { $in: lstId } });
            let promises = [];
            await datas.forEach(data => {
                delete bodyObj[data._id]._id;
                promises.push(
                    db.collection(process.env.TAGS_COLLECTION).updateOne(data, { $set: bodyObj[data._id] })
                );
            });
            Promise.all(promises)
                .then(() => {
                    res.status(200).json(true);
                    db.collection(process.env.TAGS_COLLECTION).find().toArray((err, result) => {
                        tags = result;
                    });
                })
                .catch(errs => {
                    res.status(500).json("tag.controller.update");
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
            await db.collection(process.env.TAGS_COLLECTION).deleteMany({ _id: { $in: lstId } }, (err) => {
                if (err)
                    res.status(500).json('tag.controller.deleteBulk');
                else
                    res.status(200).json(true);
                db.collection(process.env.TAGS_COLLECTION).find().toArray((err, result) => {
                    tags = result;
                });
            });
        } catch (e) {
            return e;
        }
    }
}

module.exports = TagController;