var DbConnection = require('../services/db.service');
var ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
class AuthenticationController {
    constructor() {}

    async register(req, res) {
        try {
            req.body.password = bcrypt.hashSync(req.body.password);
            let db = await DbConnection.Get();
            let result = await db.collection(process.env.USER_COLLECTION).insertOne(req.body);
            await db.collection(process.env.USER_COLLECTION)
                .findOne({
                    _id: result.insertedId
                }, (err, user) => {

                    if (err) throw err;
                    const expiresIn = 24 * 60 * 60;
                    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
                        expiresIn: expiresIn
                    });
                    res.status(200).send({
                        '_id': user._id,
                        'name': `${user.firstName} ${user.lastName}`,
                        'email': user.email,
                        'access_token': accessToken,
                        'expires_in': expiresIn
                    });
                });
        } catch (e) {
            return e;
        }
    }

    async login(req, res) {
        try {
            let db = await DbConnection.Get();
            await db.collection(process.env.USER_COLLECTION)
                .findOne({
                    email: req.body.email
                }, (err, user) => {
                    if (err) throw err;
                    if (!user) return res.status(404).send('User not found!');
                    const result = bcrypt.compareSync(req.body.password, user.password);
                    if (!result) return res.status(401).send('Password not valid!');
                    const expiresIn = 24 * 60 * 60;
                    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
                        expiresIn: expiresIn
                    });
                    res.status(200).send({
                        '_id': user._id,
                        'name': `${user.firstName} ${user.lastName}`,
                        'email': user.email,
                        'access_token': accessToken,
                        'expires_in': expiresIn
                    });
                });
        } catch (e) {
            return e;
        }
    }

    async uploadImage(req, res) {
        if (!req.file) {
            console.log("Your request doesn’t have any file");
            return res.send({
                success: false
            });

        } else {
            res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
        }
    }
}

module.exports = AuthenticationController;