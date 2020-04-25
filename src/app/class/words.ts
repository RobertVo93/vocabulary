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
    constructor(){
        this.config = new Config();
    }
    _id: any;
    word: string;
    kanji: string;
    type: string;
    pronun: string;
    meaning: string;
    example: string;
    exampleMeaning: string;
    kanjiExplain: string;
    chinaMeaning: string;
    language: any;
    dataSource: any;
    tags: [];
    
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
