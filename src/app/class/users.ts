import { QuestionBase } from './questions/question-base';
import { TextboxQuestion } from './questions/question-textbox';
import { of } from 'rxjs';
import { Config } from '../configuration/config';
import { DropdownQuestion } from './questions/question-dropdown';
import { LanguageService } from '../component/data-management/language/language.service';
import { RoleService } from '../component/data-management/role/role.service';
import { Option } from '../interface/option';

export class Users {
    private config: Config;
    constructor(){
        this.config = new Config();
    }
    _id: any;
    get name() {
        return `${this.firstName} ${this.lastName}`;
    }
    email: string;  //login user
    password: string;
    firstName: string;
    lastName: string;
    language: any;  //later will config Language object
    address: string;
    phone: string;
    roles: [];   //reference field [(ObjectID(role))]
    
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;

    /**
     * each attribute need add to question => load form
     */
    public async getQuestions(langService:LanguageService, roleService:RoleService){
        let questions: QuestionBase<string>[] = [];
        //set up email question
        let validators = {};
        validators[this.config.formValidators.require]= {
            value: true,
            error_message: 'Email is required.'
        };
        validators[this.config.formValidators.email]= {
            value: true,
            error_message: 'please enter a valid email address.'
        };
        questions.push(new TextboxQuestion({
            key: 'email',
            label: 'Email',
            value: '',
            validators: validators,
            type: this.config.inputTypeDef.email,
            order: 10
        }));

        //set up password question
        validators = {};
        validators[this.config.formValidators.require]= {
            value: true,
            error_message: 'Password is required.'
        };
        validators[this.config.formValidators.minLength]= {
            value: 8,
            error_message: 'Password\'s length must be more than or equal 8 characters.'
        };
        validators[this.config.formValidators.maxLength]= {
            value: 50,
            error_message: 'Password\'s length must be less than or equal 50 characters.'
        };
        questions.push(new TextboxQuestion({
            key: 'password',
            label: 'Password',
            value: '',
            validators: validators,
            type: this.config.inputTypeDef.password,
            order: 20
        }));

        //set up confirm password question
        validators = {};
        validators[this.config.formValidators.require]= {
            value: true,
            error_message: 'Confirm Password is required.'
        };
        questions.push(new TextboxQuestion({
            key: 'confirmpassword',
            label: 'Confirm Password',
            value: '',
            validators: validators,
            type: this.config.inputTypeDef.password,
            order: 30
        }));

        //set up first name question
        validators = {};
        validators[this.config.formValidators.require]= {
            value: true,
            error_message: 'First Name is required.'
        };
        questions.push(new TextboxQuestion({
            key: 'firstName',
            label: 'First Name',
            value: '',
            validators: validators,
            type: this.config.inputTypeDef.text,
            order: 40
        }));

        //set up last name question
        validators = {};
        validators[this.config.formValidators.require]= {
            value: true,
            error_message: 'Last Name is required.'
        };
        questions.push(new TextboxQuestion({
            key: 'lastName',
            label: 'Last Name',
            value: '',
            validators: validators,
            type: this.config.inputTypeDef.text,
            order: 50
        }));

        //set up language question
        let allLanguage = await langService.getAllData();
        let options:Option[] = [];
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
            order: 60
        }));
        
        //set up address question
        questions.push(new TextboxQuestion({
            key: 'address',
            label: 'Address',
            value: '',
            type: this.config.inputTypeDef.text,
            order: 70
        }));

        //set up phone question
        questions.push(new TextboxQuestion({
            key: 'phone',
            label: 'Phone',
            value: '',
            type: this.config.inputTypeDef.tel,
            order: 80
        }));

        //set up role question
        validators = {};
        validators[this.config.formValidators.require]= {
            value: true,
            error_message: 'Role is required.'
        };
        let allRoles = await roleService.getAllData();
        options = [];
        for(var i = 0; i < allRoles.length; i++){
            options.push({
                value: allRoles[i]._id,
                viewValue: allRoles[i].name
            })
        }
        questions.push(new DropdownQuestion({
            key: 'roles',
            label: 'Roles',
            options: options,
            multiple: true,
            validators: validators,
            order: 90
          }));
        return of(questions.sort((a, b) => a.order - b.order));
    }
}
