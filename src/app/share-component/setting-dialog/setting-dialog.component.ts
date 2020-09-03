import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
interface SettingDialogData {
    sources: any,
    selectedSource: string,
    trainingModes: any,
    selectedTrainingMode: string,
    isFastReview: boolean,
    showTable: boolean,
    mark: number,
    onResetTrainedNumber: () => void
}
@Component({
    selector: 'setting-dialog',
    templateUrl: 'setting-dialog.component.html',
})
export class SettingDialog {
    showRecordMark: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<SettingDialog>,
        @Inject(MAT_DIALOG_DATA) public data: SettingDialogData) {
        this.data.mark = this.data.mark != null ? this.data.mark : -1;
        this.showRecordMark = this.data.mark != -1;
    }

    onResetTrainedNumber(): void {
        this.data.onResetTrainedNumber();
        this.dialogRef.close();
    }

    onMarkChangeHandler(event) {
        this.data.mark = (this.data.mark + 1) % 3;
    }

    onClickOk(){
        this.data.mark = this.showRecordMark ? this.data.mark : -1;
        this.dialogRef.close(this.data);
    }

    onShowMarkClick(){
        this.data.mark = this.showRecordMark ? 0 : -1;
    }
}