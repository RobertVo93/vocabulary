var DbConnection = require('../services/db.service');
const User = require('../classes/user');
var ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');
var users;
class UserController {
    constructor() {}
    async getAll(req, res) {
        try {
            console.log('get all users');
            let db = await DbConnection.Get();
            if (users == null) {
                await db.collection(process.env.USER_COLLECTION)
                    .find()
                    .toArray((err, result) => {
                        if (err) throw err;
                        users = result;
                        res.json(users);
                        console.log('users are not store in session');
                    });
            } else {
                res.json(users);
            }
        } catch (e) {
            return e;
        }
    }

    async getById(req, res) {
        try {
            if (users == null) {
                let db = await DbConnection.Get();
                await db.collection(process.env.USER_COLLECTION)
                    .findOne({
                        _id: req.params.id
                    }, (err, result) => {
                        if (err) throw err;
                        res.json(result);
                    });
            } else {
                var result = {};
                for (var i = 0; i < users.length; i++) {
                    if (users[i]._id == req.params.id) {
                        result = users[i];
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
            let newObj = new User(req.body);
            newObj.password = bcrypt.hashSync(newObj.password);
            console.log('create new user')
            let db = await DbConnection.Get();
            await db.collection(process.env.USER_COLLECTION)
                .insertOne(newObj, (err, result) => {
                    if (err) {
                        return res.status(500).json(err.message);
                    }
                    res.json(result);
                    db.collection(process.env.USER_COLLECTION).find().toArray((err, result) => {
                        users = result;
                    });
                });
        } catch (e) {
            return e;
        }
    }

    async update(req, res) {
        try {
            console.log('Update user');
            let lstId = [];
            let bodyObj = {};
            if (req.body) {
                for (var i = 0; i < req.body.length; i++) {
                    var objId = ObjectId(req.body[i]._id);
                    lstId.push(objId);
                    bodyObj[objId] = new User(req.body[i]);
                }
            }
            let db = await DbConnection.Get();
            let datas = await db.collection(process.env.USER_COLLECTION).find({ _id: { $in: lstId } });
            let promises = [];
            await datas.forEach(data => {
                delete bodyObj[data._id]._id;
                promises.push(
                    db.collection(process.env.USER_COLLECTION).updateOne(data, { $set: bodyObj[data._id] })
                );
            });
            Promise.all(promises)
                .then(() => {
                    res.status(200).json(true);
                    db.collection(process.env.USER_COLLECTION).find().toArray((err, result) => {
                        users = result;
                    });
                })
                .catch(errs => {
                    res.status(500).json("user.controller.update");
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
            await db.collection(process.env.USER_COLLECTION).deleteMany({ _id: { $in: lstId } }, (err) => {
                if (err)
                    res.status(500).json('user.controller.deleteBulk');
                else
                    res.status(200).json(true);
                db.collection(process.env.USER_COLLECTION).find().toArray((err, result) => {
                    users = result;
                });
            });
        } catch (e) {
            return e;
        }
    }
}

module.exports = UserController;