import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { QuestionBase } from '../../../../class/questions/question-base';
import { QuestionControlService } from '../../services/question-control.service';
import { CallbackReturn } from 'src/app/interface/callbackReturn';

@Component({
	selector: 'app-dynamic-form',
	templateUrl: './dynamic-form.component.html',
	styleUrls: ['./dynamic-form.component.css'],
	providers: [QuestionControlService]
})
export class DynamicFormComponent implements OnInit {

	@Input() questions: QuestionBase<string>[] = [];
	form: FormGroup;
	error_messages;
	payLoad = '';

	constructor(private qcs: QuestionControlService) { }

	ngOnInit() {
		this.form = this.qcs.toFormGroup(this.questions);
		this.error_messages = this.qcs.getErrorMessage(this.questions);
		//handle callback function
		for(let i = 0; i < this.questions.length; i++){
			if(this.questions[i].changeHandlerCallbackFunction){
				this.form.get(this.questions[i].key).valueChanges.subscribe(val => {
					if(!val)
						return;
					setTimeout(()=>{
						var result = <CallbackReturn>this.questions[i].changeHandlerCallbackFunction(val);
						this.form.get(result.targetField).setValue(result.value);
					});
				});
			}
		}
	}

	onSubmit() {
		this.payLoad = JSON.stringify(this.form.getRawValue());
	}
}
