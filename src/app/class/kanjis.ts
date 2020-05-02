import { QuestionBase } from './question-base';
import { TextboxQuestion } from './question-textbox';
import { of } from 'rxjs';
import { Config } from '../configuration/config';
import { DropdownQuestion } from './question-dropdown';
import { LanguageService } from '../component/data-management/language/language.service';
import { Option } from '../interface/option';
import { DataSourcesService } from '../component/data-management/data-sources/data-sources.service';
import { TagsService } from '../component/data-management/tag-management/tags.service';

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
    remember: string;
    explain: string;
    JLPTLevel: number;
    
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
            label: 'Word',
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

        //set up full meaning question
        questions.push(new TextboxQuestion({
            key: 'fullMeaning',
            label: 'Full-Mean',
            value: '',
            type: this.config.inputTypeDef.text,
            order: 30
        }));

        //set up Name of image question
        questions.push(new TextboxQuestion({
            key: 'fullName',
            label: 'Name of image',
            value: '',
            type: this.config.inputTypeDef.text,
            order: 40
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
        questions.push(new TextboxQuestion({
            key: 'explain',
            label: 'Explain Kanji',
            value: '',
            type: this.config.inputTypeDef.text,
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

        return of(questions.sort((a, b) => a.order - b.order));
    }
}
