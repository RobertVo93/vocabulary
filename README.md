# LanguageAngularApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.14.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Intergrate with MongoDB (https://zellwk.com/blog/crud-express-mongodb/)

Step 1: `npm install express path --save`

step 2: `npm install body-parser --save`

step 3: `npm install mongodb --save`

step 4 (optional): `npm install nodemon --save-dev`

step 5: connect to mongodb cloud: create a server.js file in root folder to run nodejs and add the following code

```
const uri = "mongodb+srv://<username>:<password>@cluster0-gufaj.mongodb.net/test?retryWrites=true&w=majority";
//Install express server
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Serve only the static files form the dist directory
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/*', function(req,res) {
   res.sendFile(path.join(__dirname+'/dist/language-angular-app/index.html'));
});
// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);

const MongoClient = require('mongodb').MongoClient
MongoClient.connect(uri, {
    useUnifiedTopology: true
})
.then(client => {
    console.log('Connected to Database')
    //TODO implement code
})
.catch(error => console.error(error))
```

## Deploy github page

Step 1: `npm install -g angular-cli-ghpages` (Run only for the first time when your environment haven't installed angular-cli-ghpages yet.

step 2: `ng build --prod --base-href https://robertvo93.github.io/language-angular-app/`

step 3: `ng build --prod --base-href=/language-angular-app/`

step 4: `ngh --dir=dist/language-angular-app`

## Deploy heroku cloud (https://itnext.io/how-to-deploy-angular-application-to-heroku-1d56e09c5147)

step 1: Add the following code to package.json
```
"engines": {
    "node": "6.11.0",
    "npm": "3.10.10"
  }
```
step 2: Under "script" in package.json add the following code.

```"heroku-postbuild": "ng build --prod"```

step 3: coppy the following code from `devDependencies` to `dependencies`
```
"@angular/cli": "~8.3.14",
"@angular/compiler-cli": "~8.2.11",
"typescript": "~3.5.3"
```

step 4: change the start command like following
```
"start": "node server.js"
```
step 5: `npm install enhanced-resolve@3.3.0 --save-dev`

step 6: `npm install express path --save`

step 7: config heroku cloud https://dashboard.heroku.com/

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
