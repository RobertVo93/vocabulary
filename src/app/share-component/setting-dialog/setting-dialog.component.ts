import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
interface SettingDialogData {
    sources: any,
    selectedSource: string,
    trainingModes: any,
    selectedTrainingMode: string,
    isFastReview: boolean,
    showTable: boolean,
    onResetTrainedNumber: () => void
}
@Component({
    selector: 'setting-dialog',
    templateUrl: 'setting-dialog.component.html',
})
export class SettingDialog {

    constructor(
        public dialogRef: MatDialogRef<SettingDialog>,
        @Inject(MAT_DIALOG_DATA) public data: SettingDialogData) { }

    onResetTrainedNumber(): void {
        this.data.onResetTrainedNumber();
        this.dialogRef.close();
    }

}