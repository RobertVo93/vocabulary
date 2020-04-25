const rxjs = require('rxjs');
const http = require('@angular/common/http');
class CommonService {
    constructor() {}

    ok(body) {
        return rxjs.of(new http.HttpResponse({ status: 200, body }))
    }

    error(message) {
        return rxjs.throwError({ error: { message } });
    }

    unauthorized() {
        return rxjs.throwError({ status: 401, error: { message: 'Unauthorised' } });
    }

    isLoggedIn(headers) {
        return headers.get('Authorization') === `Bearer ${process.env.SECRET_KEY}`;
    }

    idFromUrl() {
        const urlParts = url.split('/');
        return parseInt(urlParts[urlParts.length - 1]);
    }
}

module.exports = CommonService;