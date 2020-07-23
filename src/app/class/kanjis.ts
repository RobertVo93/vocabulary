import { of } from 'rxjs';
import { QuestionBase } from './questions/question-base';
import { TextboxQuestion } from './questions/question-textbox';
import { DropdownQuestion } from './questions/question-dropdown';
import { FileQuestion } from './questions/question-file';
import { Config } from '../configuration/config';
import { Option } from '../interface/option';
import { CkeditorQuestion } from './questions/question-ckeditor';
import { CallbackReturn } from '../interface/callbackReturn';
import { CommonService } from '../services/common.service';
import { TagsService } from '../component/data-management/tag/tags.service';
import { HTMLViewerQuestion } from './questions/question-htmlviewer';
import { Words } from './words';

export class Kanjis {
    private config: Config;
    private common: CommonService;
    private allKanjis: Kanjis[];
    private allWords: Words[];
    constructor(obj?){
        this._id = (obj != null && obj._id != null)? obj._id : null;
        this.word = (obj != null && obj.word != null)? obj.word : null;
        this.meaning = (obj != null && obj.meaning != null)? obj.meaning : null;
        this.fullMeaning = (obj != null && obj.fullMeaning != null)? obj.fullMeaning : null;
        this.fullName = (obj != null && obj.fullName != null)? obj.fullName : null;
        this.kanji = (obj != null && obj.kanji != null) ? obj.kanji : null;
        this.remember = (obj != null && obj.remember != null)? obj.remember : null;
        this.explain = (obj != null && obj.explain != null)? obj.explain : null;
        this.JLPTLevel = (obj != null && obj.JLPTLevel != null)? obj.JLPTLevel : null;
        this.tags = (obj != null && obj.tags != null) ? obj.tags : null;
        this.relatedWords = (obj != null && obj.relatedWords != null) ? obj.relatedWords : null;
        this.filename = (obj != null && obj.filename != null)? obj.filename : null;
        this.trainedNumber = (obj != null && obj.trainedNumber != null)? obj.trainedNumber : 0;
        
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
    tags: string[];
    filename: string;
    trainedNumber: number;
    relatedWords: string;
    
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    rowColor: string;
    order: number;

    /**
     * Update KanjiExplain when add kanji
     */
    private callbackKanjiExplainUpdate(): CallbackReturn {
        let kanji = arguments[0];
        let result:CallbackReturn = {
            targetField: 'kanji',
            value: ''
        };
        if(kanji){
            for(var i = 0; i < kanji.length; i++){
                if(this.common.isKanji(kanji[i])){
                    result.value = kanji[i];
                    break;
                }
            }
        }
        
        return result;
    }

    /**
     * Update related words appropriate with the kanji
     */
    private callbackKanjiUpdate(): CallbackReturn {
        let kanji = arguments[0];
        let result:CallbackReturn = {
            targetField: 'relatedWords',
            value: ''
        };;
        if(kanji){
            let relatedWordsTableHTML = `
            <table style="background-color:rgb(255, 255, 255);border-left:1px solid rgb(239, 238, 238);border-right:1px solid rgb(239, 238, 238);">
                <tbody>
                ${
                    this.allWords.filter((val)=>{
                        return val.kanji.indexOf(kanji) != -1;
                    }).map((value)=> (
                    `
                    <tr>
                        <td style="border-right:1px solid rgb(239, 238, 238);border-top:1px solid rgb(221, 221, 221);padding:4px !important;vertical-align:top;width:183.333px;">${value.kanji}</td>
                        <td style="border-right:1px solid rgb(239, 238, 238);border-top:1px solid rgb(221, 221, 221);padding:4px !important;vertical-align:top;width:183.333px;">${value.word}</td>
                        <td style="border-right:1px solid rgb(239, 238, 238);border-top:1px solid rgb(221, 221, 221);padding:4px !important;vertical-align:top;width:183.333px;">${value.chinaMeaning}</td>
                        <td style="border-top:1px solid rgb(221, 221, 221);padding:4px !important;vertical-align:top;width:183.333px;">${value.meaning}</td>
                    </tr>
                    `
                    ))
                }
                </tbody>
            </table>`;
        result.value = relatedWordsTableHTML;
        }
        return result;
    }
    
    /**
     * each attribute need add to question => load form
     */
    public async getQuestions(common: CommonService, config: Config, allKanjis: Kanjis[], tagService: TagsService, allWords: Words[]){
        this.common = common;
        this.config = config;
        this.allKanjis = allKanjis;
        this.allWords = allWords;
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
            value: this.word,
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
            value: this.meaning,
            validators: validators,
            type: this.config.inputTypeDef.text,
            order: 20
        }));

        //set up meaning question
        questions.push(new TextboxQuestion({
            key: 'remember',
            label: 'Remember method',
            value: this.remember,
            type: this.config.inputTypeDef.text,
            order: 50
        }));

        //set up Name of image question
        questions.push(new CkeditorQuestion({
            key: 'explain',
            label: 'Explain Kanji',
            value: this.explain,
            order: 60,
            changeHandlerCallbackFunction: this.callbackKanjiExplainUpdate.bind(this)
        }));

        //set up Kanji explain question
        questions.push(new TextboxQuestion({
            key: 'kanji',
            label: 'Kanji',
            value: this.kanji,
            rows: 10,
            order: 65,
            readonly: true,
            changeHandlerCallbackFunction: this.callbackKanjiUpdate.bind(this)
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
            value: this.JLPTLevel,
            multiple: false,
            order: 70
        }));

        //set up tags question
        let allTags = await tagService.getAllData();
        options = [];
        for (var i = 0; i < allTags.length; i++) {
            options.push({
                value: allTags[i]._id,
                viewValue: allTags[i].name
            });
        }
        questions.push(new DropdownQuestion({
            key: 'tags',
            label: 'Tags',
            options: options,
            multiple: true,
            value: this.tags,
            order: 75
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
            value: this.filename,
            validators: validators,
            order: 80
        }));

        //set up Related Words question
        questions.push(new HTMLViewerQuestion({
            key: 'relatedWords',
            label: 'Related Words',
            value: this.relatedWords,
            order: 90,
            readonly: true
        }));

        return of(questions.sort((a, b) => a.order - b.order));
    }
}
