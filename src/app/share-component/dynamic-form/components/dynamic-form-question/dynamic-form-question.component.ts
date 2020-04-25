import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { QuestionBase } from '../../../../class/question-base';

@Component({
	selector: 'app-question',
	templateUrl: './dynamic-form-question.component.html',
	styleUrls: ['./dynamic-form-question.component.css']
})
export class DynamicFormQuestionComponent {
	@Input() question: QuestionBase<string>;
	@Input() form: FormGroup;
	@Input() errorMessages;
	get isValid() { return this.form.controls[this.question.key].valid; }
}
