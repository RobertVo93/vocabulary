var DbConnection = require('../services/db.service');
const DataSource = require('../classes/dataSource');
var ObjectId = require('mongodb').ObjectID;
var datasources;
class DataSourceController {
    constructor() {}
    async getAll(req, res) {
        try {
            let db = await DbConnection.Get();
            if (datasources == null) {
                await db.collection(process.env.DATASOURCE_COLLECTION)
                    .find()
                    .toArray((err, result) => {
                        if (err) throw err;
                        datasources = result;
                        res.json(datasources);
                        console.log('Data Sources are not store in session');
                    });
            } else {
                res.json(datasources);
            }
        } catch (e) {
            return e;
        }
    }

    async getById(req, res) {
        try {
            if (datasources == null) {
                let db = await DbConnection.Get();
                await db.collection(process.env.DATASOURCE_COLLECTION)
                    .findOne({
                        _id: req.params.id
                    }, (err, result) => {
                        if (err) throw err;
                        res.json(result);
                    });
            } else {
                var result = {};
                for (var i = 0; i < datasources.length; i++) {
                    if (datasources[i]._id == req.params.id) {
                        result = datasources[i];
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
            let newObj = new DataSource(req.body);
            let db = await DbConnection.Get();
            await db.collection(process.env.DATASOURCE_COLLECTION)
                .insertOne(newObj, (err, result) => {
                    if (err) throw err;
                    res.json(result);
                    db.collection(process.env.DATASOURCE_COLLECTION).find().toArray((err, result) => {
                        datasources = result;
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
                    bodyObj[objId] = req.body[i];
                }
            }
            let db = await DbConnection.Get();
            let datas = await db.collection(process.env.DATASOURCE_COLLECTION).find({ _id: { $in: lstId } });
            let promises = [];
            await datas.forEach(data => {
                delete bodyObj[data._id]._id;
                promises.push(
                    db.collection(process.env.DATASOURCE_COLLECTION).updateOne(data, { $set: bodyObj[data._id] })
                );
            });
            Promise.all(promises)
                .then(() => {
                    res.status(200).json(true);
                    db.collection(process.env.DATASOURCE_COLLECTION).find().toArray((err, result) => {
                        datasources = result;
                    });
                })
                .catch(errs => {
                    res.status(500).json("dataSource.controller.update");
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
            await db.collection(process.env.DATASOURCE_COLLECTION).deleteMany({ _id: { $in: lstId } }, (err) => {
                if (err)
                    res.status(500).json('dataSource.controller.deleteBulk');
                else
                    res.status(200).json(true);
                db.collection(process.env.DATASOURCE_COLLECTION).find().toArray((err, result) => {
                    datasources = result;
                });
            });
        } catch (e) {
            return e;
        }
    }
}

module.exports = DataSourceController;