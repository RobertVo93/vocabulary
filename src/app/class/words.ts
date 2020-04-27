import { QuestionBase } from './question-base';
import { TextboxQuestion } from './question-textbox';
import { of } from 'rxjs';
import { Config } from '../configuration/config';
import { DropdownQuestion } from './question-dropdown';
import { LanguageService } from '../component/data-management/language/language.service';
import { Option } from '../interface/option';
import { DataSourcesService } from '../component/data-management/data-sources/data-sources.service';
import { TagsService } from '../component/data-management/tag-management/tags.service';

export class Words {
    private config: Config;
    constructor(obj?){
        this.config = new Config();
        this._id = (obj != null && obj._id != null)? obj._id : null;
        this.word = (obj != null && obj.word != null)? obj.word : null;
        this.kanji = (obj != null && obj.kanji != null)? obj.kanji : null;
        if(obj != null && obj.type != null){
            if(obj.type.indexOf("v") == 0){
                this.type = this.config.wordType.verb;
            }
            else if(obj.type.indexOf("adj") == 0){
                this.type = this.config.wordType.adjective;
            }
            else if(obj.type.indexOf('n') == 0){
                this.type = this.config.wordType.noun;
            }
            else if(obj.type.indexOf('p')==0){
                this.type = this.config.wordType.prep;
            }
            else if(obj.type.indexOf('ad') == 0){
                this.type = this.config.wordType.adverd;
            }
        }
        else{
            this.type = null;
        }
        //this.type = (obj != null && obj.type != null)? obj.type : null;
        this.pronun = (obj != null && obj.pronun != null)? obj.pronun : null;
        this.meaning = (obj != null && obj.meaning != null)? obj.meaning : null;
        this.example = (obj != null && obj.example != null)? obj.example : null;
        this.exampleMeaning = (obj != null && obj.title != null)? obj.title : null;
        this.kanjiExplain = (obj != null && obj.kanjiExplain != null)? obj.kanjiExplain : null;
        this.chinaMeaning = (obj != null && obj.chinaMeaning != null)? obj.chinaMeaning : null;
        this.language = (obj != null && obj.language != null)? obj.language : null;
        this.dataSource = (obj != null && obj.dataSource != null)? obj.dataSource : null;
        this.tags = (obj != null && obj.tags != null)? obj.tags : null;
        this.createdBy = (obj != null && obj.createdBy != null)? obj.createdBy : null;
        this.createdDate = (obj != null && obj.createdDate != null)? obj.createdDate : null;
        this.modifiedBy = (obj != null && obj.modifiedBy != null)? obj.modifiedBy : null;
        this.modifiedDate = (obj != null && obj.modifiedDate != null)? obj.modifiedDate : null;
    }
    _id: any;
    word: string;
    kanji: string;
    type: number;
    pronun: string;
    meaning: string;
    example: string;
    exampleMeaning: string;
    kanjiExplain: string;
    chinaMeaning: string;
    language: any;
    dataSource: any;
    tags: string[];
    
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;

    /**
     * each attribute need add to question => load form
     */
    public async getQuestions(langService:LanguageService, dataSourceService:DataSourcesService, tagService: TagsService){
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
        
        //set up kanji question
        questions.push(new TextboxQuestion({
            key: 'kanji',
            label: 'Kanji',
            value: '',
            type: this.config.inputTypeDef.text,
            order: 20
        }));
        
        let options:Option[] = [];
        for(var option in this.config.wordType){
            options.push({
                value: parseInt(this.config.wordType[option]),
                viewValue: option
            })
        }

        //set up type question
        questions.push(new DropdownQuestion({
            key: 'type',
            label: 'type',
            options: options,
            multiple: false,
            order: 30
        }));

        //set up pronun question
        questions.push(new TextboxQuestion({
            key: 'pronun',
            label: 'Pronunciation',
            value: '',
            type: this.config.inputTypeDef.text,
            order: 40
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
            order: 50
        }));
        
        //set up example question
        questions.push(new TextboxQuestion({
            key: 'example',
            label: 'Example',
            value: '',
            type: this.config.inputTypeDef.text,
            order: 60
        }));

        //set up exampleMeaning question
        questions.push(new TextboxQuestion({
            key: 'exampleMeaning',
            label: 'Example meaning',
            value: '',
            type: this.config.inputTypeDef.text,
            order: 70
        }));

        //set up kanjiExplain question
        questions.push(new TextboxQuestion({
            key: 'kanjiExplain',
            label: 'Kanji explain',
            value: '',
            type: this.config.inputTypeDef.text,
            order: 80
        }));

        //set up chinaMeaning question
        questions.push(new TextboxQuestion({
            key: 'chinaMeaning',
            label: 'China Meaning',
            value: '',
            type: this.config.inputTypeDef.text,
            order: 90
        }));

          //set up language question
          let allLanguage = await langService.getAllData();
          options = [];
          for(var i = 0; i < allLanguage.length; i++){
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
              order: 100
          }));

        //set up data source question
        let allDataSources = await dataSourceService.getAllData();
        options = [];
        for(var i = 0; i < allDataSources.length; i++){
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
            order: 110
          }));

          //set up data source question
        let allTags = await tagService.getAllData();
        options = [];
        for(var i = 0; i < allTags.length; i++){
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
            order: 90
          }));
        return of(questions.sort((a, b) => a.order - b.order));
    }
}
