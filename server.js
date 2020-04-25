const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const routers = require('./server/routes/routes.js');
const DbConnection = require('./server/services/db.service');
const PORT = process.env.PORT || 8080;
const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
}

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use('/', new routers().router);
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//connect db
DbConnection.Get();

if (process.env.PRODUCTION == "true") {
    runDeploy(app);
} else {
    console.log('run in localhost');
}

function runDeploy(app) {
    app.use(express.static(__dirname + '/dist/language-angular-app'));
    app.get('/*', function(req, res) {
        res.sendFile(path.join(__dirname + '/dist/language-angular-app/index.html'));
    });
}