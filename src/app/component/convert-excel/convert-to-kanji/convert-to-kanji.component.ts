import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { Config } from 'src/app/configuration/config';
import { CommonService } from 'src/app/services/common.service';
import { Kanjis } from 'src/app/class/kanjis';
import { KanjiService } from '../../data-management/kanji/kanji.service';
import { MatDialog } from '@angular/material';
import { CommonDialogComponent } from 'src/app/share-component/common-dialog/common-dialog.component';

@Component({
	selector: 'app-convert-to-kanji',
	templateUrl: './convert-to-kanji.component.html',
	styleUrls: ['./convert-to-kanji.component.css']
})
export class ConvertToKanjiComponent implements OnInit {

	constructor(private config: Config, private common: CommonService, public service: KanjiService, public dialog: MatDialog) { }
	fileName: string = 'file\'s name';
	selectedFileName: string = 'Choose file';
	showResult: boolean = false;
	ngOnInit() {
	}
	datas: any;

	/**
	 * Import kanji to database
	 */
	onImportDB(){
		let kanji = this.convertToKanjiObject(this.datas);//convert excel data to WordObject
		this.service.createData(kanji).subscribe(
			(res) => {
				this.dialog.open(CommonDialogComponent, {
					width: '300px',
					data: {
						title: this.config.commonMessage.notification
						, message: this.config.commonMessage.createSuccessfull
						, action: {
							ok: true
						}
					}
				}).afterClosed().subscribe(response => {
					location.reload();
				});
			},
			(err) => {
				console.log(err);
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
		)
	}

	/**
	 * upload file excel
	 * @param evt event
	 */
	onFileChange(evt: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(evt.target);
		this.datas = target.files;
		this.selectedFileName = this.datas.length + " files";
	}
	/** 
	 * Export data to txt file
	*/
	export(): void {
		let kanji = this.convertToKanjiObject(this.datas);//convert excel data to WordObject
		var blob = new Blob([JSON.stringify(kanji)], { type: "text/plain;charset=utf-8" });	//convert to string and export
		saveAs(blob, this.fileName + ".txt");	//save to txt file
	}

	/**
	 * convert data to kanji object
	 * @param data data need to convert
	 */
	private convertToKanjiObject(data: any[][]): Kanjis[] {
		let result: Kanjis[] = [];
		for (var i = 0; i < data.length; i++) {
			var splitArr = data[i]['name'].split(' - ');	//Ex: data[i]['name'] = "ác - ác tâm.PNG"
			var kanji = new Kanjis();
			kanji.fullName = data[i]['name'];				//Ex: ác - ác tâm.PNG
			kanji.word = splitArr[0];						//Ex: ác
			if(splitArr[1] == null) {
				console.log(data[i]['name']);
				continue;
			}
			kanji.meaning = splitArr[1].split('.')[0];		//Ex: ác tâm
			kanji.order = data[i]['lastModified'];
			result.push(kanji);
		}
		return result.sort(function(a, b){ return a.order - b.order;});
	}
}

