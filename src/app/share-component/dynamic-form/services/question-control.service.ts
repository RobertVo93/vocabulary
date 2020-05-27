import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { QuestionBase } from '../../../class/questions/question-base';

@Injectable()
export class QuestionControlService {
	constructor() { }
	toFormGroup(questions: QuestionBase<string>[]) {
		let ispasswordNotMatch: number = 0;
		let group: any = {};
		questions.forEach(question => {
			let arr = [];
			for (var prop in question.validators) {
				if (typeof (question.validators[prop].value) == "number") {	//this is validator for min, max, minLength, maxLength ...
					arr.push(Validators[prop](question.validators[prop].value));
				}
				else {
					arr.push(Validators[prop]);
				}
			}
			if(question.key == 'password' || question.key == 'confirmpassword'){
				ispasswordNotMatch++;
			}
			group[question.key] = new FormControl(question.value || '', arr);
		});
		if(ispasswordNotMatch == 2)
			return new FormGroup(group, { validators: this.password.bind(this) });
		else 
			return new FormGroup(group);
	}

	getErrorMessage(questions: QuestionBase<string>[]) {
		let error_messages = {};
		for(var i = 0; i < questions.length; i++){
			var value = questions[i];
			var objValidator = [];
			for(var prop in value.validators){
				objValidator.push({
					type: prop.toLowerCase()
					, message: value.validators[prop].error_message
				});
			}
			error_messages[value.key] = objValidator;
		}
		return error_messages;
	}

	private password(formGroup: FormGroup) {
		const { value: password } = formGroup.get('password');
		const { value: confirmPassword } = formGroup.get('confirmpassword');
		return password === confirmPassword ? null : { passwordNotMatch: true };
	}
}
