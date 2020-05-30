//make consistent with language.ts in frontend
export class ResponseData {
    constructor(obj?) {
        this.success = (obj != null && obj.success != null) ? obj.success : null;
        this.message = (obj != null && obj.message != null) ? obj.message : '';
        this.returnObj = (obj != null && obj.returnObj != null) ? obj.returnObj : '';
        this.status = (obj != null && obj.status != null) ? obj.status : '';
    }
    success;
    message;
    returnObj;
    status;
}