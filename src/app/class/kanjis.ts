import { of } from 'rxjs';
import { QuestionBase } from './questions/question-base';
import { TextboxQuestion } from './questions/question-textbox';
import { DropdownQuestion } from './questions/question-dropdown';
import { FileQuestion } from './questions/question-file';
import { Config } from '../configuration/config';
import { Option } from '../interface/option';
import { InlineTextQuestion } from './questions/question-inlineText';

export class Kanjis {
    private config: Config;
    constructor(obj?){
        this.config = new Config();
        this._id = (obj != null && obj._id != null)? obj._id : null;
        this.word = (obj != null && obj.word != null)? obj.word : null;
        this.meaning = (obj != null && obj.meaning != null)? obj.meaning : null;
        this.fullMeaning = (obj != null && obj.fullMeaning != null)? obj.fullMeaning : null;
        this.fullName = (obj != null && obj.fullName != null)? obj.fullName : null;
        this.remember = (obj != null && obj.remember != null)? obj.remember : null;
        this.explain = (obj != null && obj.explain != null)? obj.explain : null;
        this.JLPTLevel = (obj != null && obj.JLPTLevel != null)? obj.JLPTLevel : null;
        this.filename = (obj != null && obj.filename != null)? obj.filename : null;
        
        this.createdBy = (obj != null && obj.createdBy != null)? obj.createdBy : null;
        this.createdDate = (obj != null && obj.createdDate != null)? obj.createdDate : null;
        this.modifiedBy = (obj != null && obj.modifiedBy != null)? obj.modifiedBy : null;
        this.modifiedDate = (obj != null && obj.modifiedDate != null)? obj.modifiedDate : null;
    }
    _id: any;
    word:string;
    meaning:string;
    fullMeaning: string;
    fullName:string;
    kanji: string;
    remember: string;
    explain: string;
    JLPTLevel: number;
    filename: string;
    
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    rowColor: string;
    order: number;

    /**
     * each attribute need add to question => load form
     */
    public getQuestions(){
        let questions: QuestionBase<string>[] = [];
        //set up word question
        let validators = {};
        validators[this.config.formValidators.require]= {
            value: true,
            error_message: 'Word is required.'
        };
        questions.push(new TextboxQuestion({
            key: 'word',
            label: 'China Meaning',
            value: '',
            validators: validators,
            type: this.config.inputTypeDef.text,
            order: 10
        }));
        
        //set up meaning question
        validators = {};
        validators[this.config.formValidators.require]= {
            value: true,
            error_message: 'Meaning is required.'
        };
        questions.push(new TextboxQuestion({
            key: 'meaning',
            label: 'Meaning',
            value: '',
            validators: validators,
            type: this.config.inputTypeDef.text,
            order: 20
        }));

        //set up meaning question
        questions.push(new TextboxQuestion({
            key: 'remember',
            label: 'Remember method',
            value: '',
            type: this.config.inputTypeDef.text,
            order: 50
        }));

        //set up Name of image question
        questions.push(new InlineTextQuestion({
            key: 'explain',
            label: 'Explain Kanji',
            value: '',
            order: 60
        }));

        let options:Option[] = [];
        for(var option in this.config.kanjiLevelOptions){
            if(option != '-1'){
                options.push({
                    value: parseInt(option),
                    viewValue: this.config.kanjiLevelOptions[option]
                });
            }
        }

        //set up type question
        questions.push(new DropdownQuestion({
            key: 'JLPTLevel',
            label: 'JLPT Level',
            options: options,
            multiple: false,
            order: 70
        }));

        //set up meaning question
        validators = {};
        validators[this.config.formValidators.require]= {
            value: true,
            error_message: 'Image is required.'
        };
        questions.push(new FileQuestion({
            key: 'filename',
            label: 'Image',
            value: '',
            validators: validators,
            order: 80
        }));

        return of(questions.sort((a, b) => a.order - b.order));
    }
}