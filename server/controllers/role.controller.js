var DbConnection = require('../services/db.service');
const Role = require('../classes/role');
var ObjectId = require('mongodb').ObjectID;
var roles;
class RoleController {
    constructor() {}
    async getAll(req, res) {
        try {
            let db = await DbConnection.Get();
            if (roles == null) {
                await db.collection(process.env.ROLE_COLLECTION)
                    .find()
                    .toArray((err, result) => {
                        if (err) throw err;
                        roles = result;
                        res.json(roles);
                        console.log('Roles are not store in session');
                    });
            } else {
                res.json(roles);
            }
        } catch (e) {
            return e;
        }
    }

    async getById(req, res) {
        try {
            if (roles == null) {
                let db = await DbConnection.Get();
                await db.collection(process.env.ROLE_COLLECTION)
                    .findOne({
                        _id: req.params.id
                    }, (err, result) => {
                        if (err) throw err;
                        res.json(result);
                    });
            } else {
                var result = {};
                for (var i = 0; i < roles.length; i++) {
                    if (roles[i]._id == req.params.id) {
                        result = roles[i];
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
            let newObj = new Role(req.body);
            let db = await DbConnection.Get();
            await db.collection(process.env.ROLE_COLLECTION)
                .insertOne(newObj, (err, result) => {
                    if (err) throw err;
                    res.json(result);
                    db.collection(process.env.ROLE_COLLECTION).find().toArray((err, result) => {
                        roles = result;
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
                    bodyObj[objId] = new Role(req.body[i]);
                }
            }
            let db = await DbConnection.Get();
            let datas = await db.collection(process.env.ROLE_COLLECTION).find({ _id: { $in: lstId } });
            let promises = [];
            await datas.forEach(data => {
                delete bodyObj[data._id]._id;
                promises.push(
                    db.collection(process.env.ROLE_COLLECTION).updateOne(data, { $set: bodyObj[data._id] })
                );
            });
            Promise.all(promises)
                .then(() => {
                    res.status(200).json(true);
                    db.collection(process.env.ROLE_COLLECTION).find().toArray((err, result) => {
                        roles = result;
                    });
                })
                .catch(errs => {
                    res.status(500).json("role.controller.update");
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
            await db.collection(process.env.ROLE_COLLECTION).deleteMany({ _id: { $in: lstId } }, (err) => {
                if (err)
                    res.status(500).json('role.controller.deleteBulk');
                else
                    res.status(200).json(true);
                db.collection(process.env.ROLE_COLLECTION).find().toArray((err, result) => {
                    roles = result;
                });
            });
        } catch (e) {
            return e;
        }
    }
}

module.exports = RoleController;