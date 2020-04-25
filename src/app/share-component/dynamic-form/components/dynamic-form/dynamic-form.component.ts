import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { QuestionBase } from '../../../../class/question-base';
import { QuestionControlService } from '../../services/question-control.service';

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
	}

	onSubmit() {
		this.payLoad = JSON.stringify(this.form.getRawValue());
	}
}
