import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { QuestionBase } from '../../../../class/question-base';
import { ImagesService } from 'src/app/component/data-management/images/images.service';
import { ResponseData } from 'src/app/class/responseData';
import { CommonDialogComponent } from 'src/app/share-component/common-dialog/common-dialog.component';
import { Config } from 'src/app/configuration/config';
import { MatDialog } from '@angular/material';

@Component({
	selector: 'app-question',
	templateUrl: './dynamic-form-question.component.html',
	styleUrls: ['./dynamic-form-question.component.css']
})
export class DynamicFormQuestionComponent {
	previewSelectedImage;
	images;
	@Input() question: QuestionBase<string>;
	@Input() form: FormGroup;
	@Input() errorMessages;

	constructor(private config: Config, private dialog: MatDialog, private imgService: ImagesService, private domSanitizer: DomSanitizer) { }
	get isValid() { return this.form.controls[this.question.key].valid; }

	/**
	 * handle image change
	 * @param event event
	 */
	onSelectImage(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.images = file;
			//preview image
			this.previewSelectedImage = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
		}
	}

	/**
	* 
	* @param el 
	* @param text 
	*/
	onUpdate(text) {
		if (text == null) { return; }
		// copy and mutate
		this.question.value = text;
	  }

	/**
	 * Submit image
	 */
	onSubmitImage() {
		var scope = this;
		const formData = new FormData();
		formData.append('files', this.images);

		this.imgService.createData(formData).subscribe(
			(res) => {
				var response = new ResponseData(res);
				if(response.success){
					scope.question.value = response.returnObj;
					this.dialog.open(CommonDialogComponent, {
						width: '300px',
						data: {
							title: this.config.commonMessage.notification
							, message: this.config.commonMessage.createSuccessfull
							, action: {
								ok: true
							}
						}
					});
					console.log(res);
				}
				else {
					this.dialog.open(CommonDialogComponent, {
						width: '300px',
						data: {
							title: this.config.commonMessage.alert
							, message: this.config.commonMessage.createError
							, action: {
								ok: true
							}
						}
					});
				}
				
			},
			(err) => {
				
				console.log(err)
			}
		);
	}
}
