let fs = require('fs');
// Configure Angular `environment.ts` file path
const targetPathDev = './src/environments/environment.ts';
const targetPathProd = './src/environments/environment.prod.ts';
// Load node modules
const colors = require('colors');
const dotenv = require('dotenv');
dotenv.config();

let serverURL = process.env.PRODUCTION == "true" ? process.env.SERVER_API_URL : process.env.LOCAL_API_URL;
// `environment.ts` file structure
const envConfigFile = `export const environment = {
    production: '${process.env.PRODUCTION}',
    serverURL: '${serverURL}'
};
`;
console.log(colors.magenta('The file `environment.ts` will be written with the following content: \n'));
console.log(colors.grey(envConfigFile));
fs.writeFile(targetPathDev, envConfigFile, function (err) {
    if (err) {
        throw console.error(err);
    } else {
        console.log(colors.magenta(`Angular environment.ts file generated correctly at ${targetPathDev} \n`));
    }
});
fs.writeFile(targetPathProd, envConfigFile, function (err) {
    if (err) {
        throw console.error(err);
    } else {
        console.log(colors.magenta(`Angular environment.ts file generated correctly at ${targetPathProd} \n`));
    }
});