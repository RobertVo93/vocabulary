import { QuestionBase } from './questions/question-base';
import { TextboxQuestion } from './questions/question-textbox';
import { of } from 'rxjs';
import { Config } from '../configuration/config';

export class DataSources {
    private config: Config;
    constructor(obj?){
        this.config = new Config();
        if(obj){
            this._id = obj._id;
            this.name = obj.name;
            this.createdBy = obj.createdBy;
            this.createdDate = obj.createdDate;
            this.modifiedBy = obj.modifiedBy;
            this.modifiedDate = obj.modifiedDate;
        }
    }
    _id: any;
    name: string;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;

    /**
     * each attribute need add to question => load form
     */
    public getQuestions(){
        let questions: QuestionBase<string>[] = [];
        var validatorsName = {};
        validatorsName[this.config.formValidators.require]= {
            value: true,
            error_message: 'Name is required.'
        };
        
        questions.push(new TextboxQuestion({
            key: 'name',
            label: 'Name',
            value: this.name,
            validators: validatorsName,
            type: this.config.inputTypeDef.text,
            order: 1
        }));
        return of(questions.sort((a, b) => a.order - b.order));
    }
}
