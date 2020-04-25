/**
 * Requirement resources
 */
const express = require('express');
const Authentication = require('../controllers/authentication.controller.js');
const Tag = require('../controllers/tag.controller.js');
const User = require('../controllers/user.controller.js');
const DataSource = require('../controllers/dataSource.controller.js');
const Role = require('../controllers/role.controller.js');
const Language = require('../controllers/language.controller.js');
const Word = require('../controllers/word.controller.js');
const customers = require('../controllers/customer.controller.js');
var multer = require('multer');
//var upload = multer({ dest: './dist/deploy-github-angular/assets/images/' });
const DIR = './dist/deploy-github-angular/assets/images/';
const path = require('path');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
    }
});
let upload = multer({ storage: storage });

class Routers {
    router;
    constructor() {
        this.router = express.Router();
        //customer routers
        this.router.post('/api/customers', customers.create);
        this.router.get('/api/customers', customers.findAll);
        this.router.get('/api/customers/:id', customers.findOne);
        this.router.put('/api/customers', customers.update);
        this.router.delete('/api/customers/:id', customers.delete);

        //tag routers
        let tags = new Tag()
        this.router.post('/api/tags', tags.createNew);
        this.router.get('/api/tags', tags.getAll);
        this.router.get('/api/tags/:id', tags.getById);
        this.router.put('/api/tags', tags.update);
        this.router.delete('/api/tags', tags.deleteBulk);

        //user routers
        let users = new User()
        this.router.post('/api/users', users.createNew);
        this.router.get('/api/users', users.getAll);
        this.router.get('/api/users/:id', users.getById);
        this.router.put('/api/users', users.update);
        this.router.delete('/api/users', users.deleteBulk);

        //data sources routers
        let dataSources = new DataSource()
        this.router.post('/api/dataSources', dataSources.createNew);
        this.router.get('/api/dataSources', dataSources.getAll);
        this.router.get('/api/dataSources/:id', dataSources.getById);
        this.router.put('/api/dataSources', dataSources.update);
        this.router.delete('/api/dataSources', dataSources.deleteBulk);

        //Role routers
        let roles = new Role()
        this.router.post('/api/roles', roles.createNew);
        this.router.get('/api/roles', roles.getAll);
        this.router.get('/api/roles/:id', roles.getById);
        this.router.put('/api/roles', roles.update);
        this.router.delete('/api/roles', roles.deleteBulk);

        //Language routers
        let languages = new Language()
        this.router.post('/api/languages', languages.createNew);
        this.router.get('/api/languages', languages.getAll);
        this.router.get('/api/languages/:id', languages.getById);
        this.router.put('/api/languages', languages.update);
        this.router.delete('/api/languages', languages.deleteBulk);

        //Word routers
        let words = new Word()
        this.router.post('/api/words', words.createNew);
        this.router.get('/api/words', words.getAll);
        this.router.get('/api/words/:id', words.getById);
        this.router.put('/api/words', words.update);
        this.router.delete('/api/words', words.deleteBulk);

        //Authentication routers
        let authen = new Authentication()
        this.router.post('/api/register', authen.register);
        this.router.post('/api/login', authen.login);
        //upload image
        this.router.post('/api/upload', upload.single('file'), authen.uploadImage);
    }
}
module.exports = Routers;