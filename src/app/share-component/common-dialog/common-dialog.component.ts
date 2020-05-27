import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from 'src/app/interface/dialogData';
import { Config } from 'src/app/configuration/config';
import { Observable } from 'rxjs';
import { QuestionBase } from '../../class/questions/question-base';
import { DynamicFormComponent } from '../dynamic-form/components/dynamic-form/dynamic-form.component';

@Component({
	selector: 'app-common-dialog',
	templateUrl: './common-dialog.component.html',
	styleUrls: ['./common-dialog.component.css']
})
export class CommonDialogComponent implements AfterViewInit{
	@ViewChild(DynamicFormComponent, {static: false}) dynamicFormComponent;
	questions$: Observable<QuestionBase<any>[]>;
	enableValidation:boolean = false;
	constructor(
		public config: Config,
		public dialogRef: MatDialogRef<CommonDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData
	) {
		this.questions$ = this.data.questions;
	}

	ngAfterViewInit() {
		setTimeout(() => {
			if(this.dynamicFormComponent != null){
				this.enableValidation = true;
			}
		});
	}

	onCancel(): void {
		this.data.returnAction = this.config.returnAction.cancel;
		this.dialogRef.close(this.data);
	}

	onDelete(): void {
		this.data.returnAction = this.config.returnAction.delete;
		this.dialogRef.close(this.data);
	}

	onUpdate(): void {
		this.data.returnAction = this.config.returnAction.update;
		this.dialogRef.close(this.data);
	}

	onSave(): void{
		//convert data in form to object
		var rawValue = this.dynamicFormComponent.form.getRawValue();
		for(var prop in rawValue){
			this.data.record[prop] = rawValue[prop];
		}
		//send back object to parent component
		this.data.returnAction = this.config.returnAction.save;
		this.dialogRef.close(this.data);
	}
}