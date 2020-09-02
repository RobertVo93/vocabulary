import { QuestionBase } from './questions/question-base';
import { TextboxQuestion } from './questions/question-textbox';
import { of } from 'rxjs';
import { Config } from '../configuration/config';
import { DropdownQuestion } from './questions/question-dropdown';
import { LanguageService } from '../component/data-management/language/language.service';
import { Option } from '../interface/option';
import { DataSourcesService } from '../component/data-management/data-sources/data-sources.service';
import { TagsService } from '../component/data-management/tag/tags.service';
import { FileQuestion } from './questions/question-file';
import { TextAreaQuestion } from './questions/question-textarea';
import { CallbackReturn } from '../interface/callbackReturn';
import { CommonService } from '../services/common.service';
import { Kanjis } from './kanjis';
import { HTMLViewerQuestion } from './questions/question-htmlviewer';

export class Words {
    private config: Config;
    private common: CommonService;
    private allKanjis: Kanjis[];
    constructor(obj?) {
        this._id = (obj != null && obj._id != null) ? obj._id : null;
        this.word = (obj != null && obj.word != null) ? obj.word : null;
        this.kanji = (obj != null && obj.kanji != null) ? obj.kanji : null;
        this.type = (obj != null && obj.type != null) ? obj.type : null;
        this.pronun = (obj != null && obj.pronun != null) ? obj.pronun : null;
        this.meaning = (obj != null && obj.meaning != null) ? obj.meaning : null;
        this.example = (obj != null && obj.example != null) ? obj.example : null;
        this.exampleTitle = (obj != null && obj.exampleTitle != null) ? obj.exampleTitle : null;
        this.exampleMeaning = (obj != null && obj.exampleMeaning != null) ? obj.exampleMeaning : null;
        this.kanjiExplain = (obj != null && obj.kanjiExplain != null) ? obj.kanjiExplain : null;
        this.chinaMeaning = (obj != null && obj.chinaMeaning != null) ? obj.chinaMeaning : null;
        this.language = (obj != null && obj.language != null) ? obj.language : null;
        this.dataSource = (obj != null && obj.dataSource != null) ? obj.dataSource : null;
        this.tags = (obj != null && obj.tags != null) ? obj.tags : null;
        this.filename = (obj != null && obj.filename != null) ? obj.filename : null;
        this.trainedNumber = (obj != null && obj.trainedNumber != null) ? obj.trainedNumber : 0;

        this.createdBy = (obj != null && obj.createdBy != null) ? obj.createdBy : null;
        this.createdDate = (obj != null && obj.createdDate != null) ? obj.createdDate : null;
        this.modifiedBy = (obj != null && obj.modifiedBy != null) ? obj.modifiedBy : null;
        this.modifiedDate = (obj != null && obj.modifiedDate != null) ? obj.modifiedDate : null;
    }
    _id: any;
    word: string;
    kanji: string;
    type: number;
    pronun: string;
    meaning: string;
    example: string;
    exampleTitle: string;
    exampleMeaning: string;
    kanjiExplain: any;
    chinaMeaning: string;
    language: any;
    dataSource: any;
    tags: string[];
    filename: string;
    trainedNumber: number;
    mark: number;

    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    rowColor: any;

    /**
     * Update KanjiExplain when add kanji
     */
    private callbackKanjiUpdate(): CallbackReturn {
        let kanji = arguments[0];
        let explain = this.common.getKanjiExplain(kanji, this.allKanjis);
        explain = explain.replace(new RegExp('\r\n', 'g'), "<br \\>").replace(new RegExp('\n', 'g'), "<br \\>");
        let result: CallbackReturn = {
            targetField: 'explainKanjiTemp',
            value: explain
        };
        return result;
    }

    /**
     * each attribute need add to question => load form
     */
    public async getQuestions(langService: LanguageService, dataSourceService: DataSourcesService,
        tagService: TagsService, common: CommonService, config: Config, allKanjis: Kanjis[]) {
        this.common = common;
        this.config = config;
        this.allKanjis = allKanjis;
        let questions: QuestionBase<string>[] = [];
        //set up word question
        let validators = {};
        validators[this.config.formValidators.require] = {
            value: true,
            error_message: 'Word is required.'
        };
        questions.push(new TextboxQuestion({
            key: 'word',
            label: 'Word',
            value: this.word,
            validators: validators,
            type: this.config.inputTypeDef.text,
            order: 10
        }));

        //set up kanji question
        questions.push(new TextboxQuestion({
            key: 'kanji',
            label: 'Kanji',
            value: this.kanji,
            type: this.config.inputTypeDef.text,
            order: 20,
            changeHandlerCallbackFunction: this.callbackKanjiUpdate.bind(this)
        }));

        //set up Kanji explain question
        questions.push(new HTMLViewerQuestion({
            key: 'explainKanjiTemp',
            label: 'Explain Kanji',
            value: '',
            rows: 10,
            order: 25,
            readonly: true
        }));

        //set up type question
        let options: Option[] = [];
        for (var option in this.config.wordType) {
            options.push({
                value: parseInt(option),
                viewValue: this.config.wordType[option]
            })
        }
        questions.push(new DropdownQuestion({
            key: 'type',
            label: 'type',
            options: options,
            multiple: false,
            value: this.type,
            order: 30
        }));

        //set up pronun question
        questions.push(new TextboxQuestion({
            key: 'pronun',
            label: 'Pronunciation',
            value: this.pronun,
            type: this.config.inputTypeDef.text,
            order: 40
        }));

        //set up meaning question
        validators = {};
        validators[this.config.formValidators.require] = {
            value: true,
            error_message: 'Meaning is required.'
        };
        questions.push(new TextboxQuestion({
            key: 'meaning',
            label: 'Meaning',
            value: this.meaning,
            validators: validators,
            type: this.config.inputTypeDef.text,
            order: 50
        }));

        //set up example question
        questions.push(new TextboxQuestion({
            key: 'example',
            label: 'Example',
            value: this.example,
            type: this.config.inputTypeDef.text,
            order: 60
        }));

        //set up exampleMeaning question
        questions.push(new TextboxQuestion({
            key: 'exampleMeaning',
            label: 'Example meaning',
            value: this.exampleMeaning,
            type: this.config.inputTypeDef.text,
            order: 70
        }));

        //set up kanjiExplain question
        questions.push(new TextboxQuestion({
            key: 'exampleTitle',
            label: 'Example Title',
            value: this.exampleTitle,
            type: this.config.inputTypeDef.text,
            order: 80
        }));

        //set up chinaMeaning question
        questions.push(new TextboxQuestion({
            key: 'chinaMeaning',
            label: 'China Meaning',
            value: this.chinaMeaning,
            type: this.config.inputTypeDef.text,
            order: 90
        }));

        //set up language question
        let allLanguage = await langService.getAllData();
        options = [];
        for (var i = 0; i < allLanguage.length; i++) {
            options.push({
                value: allLanguage[i]._id,
                viewValue: allLanguage[i].name
            })
        }
        questions.push(new DropdownQuestion({
            key: 'language',
            label: 'Language',
            options: options,
            multiple: false,
            value: this.language,
            order: 100
        }));

        //set up data source question
        let allDataSources = await dataSourceService.getAllData();
        options = [];
        for (var i = 0; i < allDataSources.length; i++) {
            options.push({
                value: allDataSources[i]._id,
                viewValue: allDataSources[i].name
            });
        }
        questions.push(new DropdownQuestion({
            key: 'dataSource',
            label: 'Data Source',
            options: options,
            multiple: false,
            value: this.dataSource,
            order: 110
        }));

        //set up data source question
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
            order: 120
        }));

        //set up meaning question
        validators = {};
        validators[this.config.formValidators.require] = {
            value: true,
            error_message: 'Image is required.'
        };
        questions.push(new FileQuestion({
            key: 'filename',
            label: 'Image',
            value: this.filename,
            validators: validators,
            order: 130
        }));
        return of(questions.sort((a, b) => a.order - b.order));
    }
}
