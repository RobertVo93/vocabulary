export class UserSetting {
    constructor(obj?) {
        this._id = (obj != null && obj._id != null) ? obj._id : null;
        this.userId = (obj != null && obj.userId != null) ? obj.userId : null;
        this.userSetting = (obj != null && obj.userSetting != null) ? obj.userSetting : null;

        this.createdBy = (obj != null && obj.createdBy != null) ? obj.createdBy : null;
        this.createdDate = (obj != null && obj.createdDate != null) ? obj.createdDate : null;
        this.modifiedBy = (obj != null && obj.modifiedBy != null) ? obj.modifiedBy : null;
        this.modifiedDate = (obj != null && obj.modifiedDate != null) ? obj.modifiedDate : null;
    }
    _id: any;
    userId: any;
    userSetting: any;

    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}
