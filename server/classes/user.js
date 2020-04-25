//make consistent with language.ts in frontend
class Language {
    constructor(obj) {
        this._id = (obj != null && obj._id != null) ? obj._id : null;
        this.email = (obj != null && obj.email != null) ? obj.email : '';
        this.password = (obj != null && obj.password != null) ? obj.password : '';
        this.firstName = (obj != null && obj.firstName != null) ? obj.firstName : '';
        this.lastName = (obj != null && obj.lastName != null) ? obj.lastName : '';
        this.language = (obj != null && obj.language != null) ? obj.language : '';
        this.address = (obj != null && obj.address != null) ? obj.address : '';
        this.phone = (obj != null && obj.phone != null) ? obj.phone : '';
        this.roles = (obj != null && obj.roles != null) ? obj.roles : '';
        this.createdBy = (obj != null && obj.createdBy != null) ? obj.createdBy : '';
        this.createdDate = (obj != null && obj.createdDate != null) ? obj.createdDate : '';
        this.modifiedBy = (obj != null && obj.modifiedBy != null) ? obj.modifiedBy : '';
        this.modifiedDate = (obj != null && obj.modifiedDate != null) ? obj.modifiedDate : '';
    }
    _id;
    email; //login user
    password;
    firstName;
    lastName;
    language; //later will config Language object
    address;
    phone;
    roles; //reference field [(ObjectID(role))]
    createdBy;
    createdDate;
    modifiedBy;
    modifiedDate;
}

module.exports = Language;