import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { Config } from 'src/app/configuration/config';
import { Kanji } from 'src/app/interface/kanji';
import { CommonService } from 'src/app/services/common.service';

@Component({
	selector: 'app-convert-to-kanji',
	templateUrl: './convert-to-kanji.component.html',
	styleUrls: ['./convert-to-kanji.component.css']
})
export class ConvertToKanjiComponent implements OnInit {

	constructor(private config: Config, private common: CommonService) { }
	fileName: string = 'file\'s name';
	selectedFileName: string = 'Choose file';
	showResult: boolean = false;
	ngOnInit() {
	}
	datas: any;

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
	private convertToKanjiObject(data: any[][]): Kanji[] {
		let result: Kanji[] = [];
		for (var i = 0; i < data.length; i++) {
			var splitArr = data[i]['name'].split(' - ');	//Ex: data[i]['name'] = "ác - ác tâm.PNG"
			var kanji: any = {};
			kanji.fullName = data[i]['name'];				//Ex: ác - ác tâm.PNG
			kanji.word = splitArr[0];						//Ex: ác
			if(splitArr[1] == null) {
				console.log(data[i]['name']);
				continue;
			}
			kanji.meaning = splitArr[1].split('.')[0];		//Ex: ác tâm
			kanji.lastModified = data[i]['lastModified'];
			kanji.lastModifiedDate = this.common.convertDateToStringByFormat(data[i]['lastModifiedDate'], 'yyyy/MM/dd HH:mmm:SS');
			kanji.order = data[i]['lastModified'];
			result.push(kanji);
		}
		return result.sort(function(a, b){ return a.order - b.order;});
	}
}

