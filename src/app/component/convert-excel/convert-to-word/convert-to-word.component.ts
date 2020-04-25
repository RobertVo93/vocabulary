import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Word } from 'src/app/interface/word';
import { Config } from 'src/app/configuration/config';
import { Kanji } from 'src/app/interface/kanji';
type AOA = any[][];

@Component({
  selector: 'app-convert-to-word',
  templateUrl: './convert-to-word.component.html',
  styleUrls: ['./convert-to-word.component.css']
})
export class ConvertToWordComponent implements OnInit {

  constructor(private config: Config) { }
  fileName: string = 'file\'s name';
  selectedFileName:string = 'Choose file';
  showResult: boolean = false;
  ngOnInit() {
  }
  datas: AOA = [];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

	/**
	 * upload file excel
	 * @param evt event
	 */
  onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1){
      alert('Cannot choose multiple files');
      throw new Error('Cannot choose multiple files');
    }
    this.selectedFileName = target.files[0].name;
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.datas = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
    };
    reader.readAsBinaryString(target.files[0]);
  }

	/** 
	 * Export data to txt file
	*/
  export(): void {
    let words = this.convertToWordObject(this.datas);//convert excel data to WordObject
    var blob = new Blob([JSON.stringify(words)], { type: "text/plain;charset=utf-8" });	//convert to string and export
    saveAs(blob, this.fileName + ".txt");	//save to txt file
  }

	/**
	 * convert data to Word object
	 * @param data data need to convert
	 */
  private convertToWordObject(data: any[][]): Word[] {
    let result: Word[] = [];	//the result variable
    if (data.length == 0) {
      return result;
    }

    let key: any[] = [];	//store all key available in sheet
    for (let i = 0; i < data[0].length; i++) {
      key.push(data[0][i].toLowerCase().split(' ').join(''));
    }
    //traverse all data and convert to Word object
    for (let i = 1; i < data.length; i++) {
      let word: any = {};
      for (let j = 0; j < data[i].length; j++) {
        //map key and assign data to appropriate property
        switch (key[j]) {
          case this.config.excelTemplateFields.word:
            word.word = data[i][j];
            break;
          case this.config.excelTemplateFields.type:
            word.type = data[i][j];
            break;
          case this.config.excelTemplateFields.meaning:
            word.meaning = data[i][j];
            break;
          case this.config.excelTemplateFields.example:
            word.example = data[i][j];
            break;
          case this.config.excelTemplateFields.title:
            word.title = data[i][j];
            break;
          case this.config.excelTemplateFields.pronun:
            word.pronun = data[i][j];
            break;
          case this.config.excelTemplateFields.kanji:
            word.kanji = data[i][j];
            break;
          case this.config.excelTemplateFields.kanjiExplain:
            word.kanjiExplain = data[i][j];
            break;
          case this.config.excelTemplateFields.image:
            word.image = data[i][j];
            break;
          case this.config.excelTemplateFields.chinaMeaning:
            word.chinaMeaning = data[i][j];
            break;
          default:
            break;
        }
      }
      if (word.word != null)
        result.push(word);
    }
    return result;
  }
}

