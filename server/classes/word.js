//make consistent with language.ts in frontend
class Word {
    constructor(obj) {
        this._id = (obj != null && obj._id != null) ? obj._id : null;
        this.word = (obj != null && obj.word != null) ? obj.word : '';
        this.kanji = (obj != null && obj.kanji != null) ? obj.kanji : '';
        this.type = (obj != null && obj.type != null) ? obj.type : '';
        this.pronun = (obj != null && obj.pronun != null) ? obj.pronun : '';
        this.meaning = (obj != null && obj.meaning != null) ? obj.meaning : '';
        this.example = (obj != null && obj.example != null) ? obj.example : '';
        this.exampleMeaning = (obj != null && obj.exampleMeaning != null) ? obj.exampleMeaning : '';
        this.kanjiExplain = (obj != null && obj.kanjiExplain != null) ? obj.kanjiExplain : '';
        this.chinaMeaning = (obj != null && obj.chinaMeaning != null) ? obj.chinaMeaning : '';
        this.language = (obj != null && obj.language != null) ? obj.language : '';
        this.dataSource = (obj != null && obj.dataSource != null) ? obj.dataSource : '';
        this.tags = (obj != null && obj.tags != null) ? obj.tags : '';
        this.createdBy = (obj != null && obj.createdBy != null) ? obj.createdBy : '';
        this.createdDate = (obj != null && obj.createdDate != null) ? obj.createdDate : '';
        this.modifiedBy = (obj != null && obj.modifiedBy != null) ? obj.modifiedBy : '';
        this.modifiedDate = (obj != null && obj.modifiedDate != null) ? obj.modifiedDate : '';
    }
    _id;
    word;
    kanji;
    type;
    pronun;
    meaning;
    example;
    exampleMeaning;
    kanjiExplain;
    chinaMeaning;
    language;
    dataSource;
    tags;
    createdBy;
    createdDate;
    modifiedBy;
    modifiedDate;
}

module.exports = Word;