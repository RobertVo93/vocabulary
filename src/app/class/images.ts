import { QuestionBase } from './questions/question-base';
import { TextboxQuestion } from './questions/question-textbox';
import { of } from 'rxjs';
import { Config } from '../configuration/config';

export class Images {
    private config: Config;
    constructor(obj?){
        this.config = new Config();
        if(obj){
            this._id = obj._id;
            this.filename = obj.filename;
            this.uploadDate = obj.uploadDate;
            this.md5 = obj.md5;
            this.contentType = obj.contentType;
            this.length = obj.length;
            this.chunkSize = obj.chunkSize;

            this.createdBy = obj.createdBy;
            this.createdDate = obj.createdDate;
            this.modifiedBy = obj.modifiedBy;
            this.modifiedDate = obj.modifiedDate;
        }
    }
    _id: any;
    filename: string;
    uploadDate: Date;
    md5: string;
    contentType: string;
    length: number;
    chunkSize: number;

    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;

    /**
     * each attribute need add to question => load form
     */
    public getQuestions(){
        let questions: QuestionBase<string>[] = [];
        var validators = {};
        validators[this.config.formValidators.require]= {
            value: true,
            error_message: 'File\'s Name is required.'
        };
        
        questions.push(new TextboxQuestion({
            key: 'filename',
            label: 'File\'s Name',
            value: this.filename,
            validators: validators,
            type: this.config.inputTypeDef.text,
            order: 1
        }));
        return of(questions.sort((a, b) => a.order - b.order));
    }
}
