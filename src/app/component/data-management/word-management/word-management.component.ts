import { Component, OnInit, ViewChild } from '@angular/core';
import { Word } from 'src/app/interface/word';
import { Option } from 'src/app/interface/option';
import { Config } from 'src/app/configuration/config';
import { MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-word-management',
  templateUrl: './word-management.component.html',
  styleUrls: ['./word-management.component.css']
})
export class WordManagementComponent implements OnInit {
  selectedDataset: number = 1;  //selected data set Id
  viewColumns: Option[];  //list of column could be viewed
  dataset: Option[];    //option for dropdownlist 'Dataset'
  selectedViewColumn: number[] = [this.config.viewColumnsDef.word, this.config.viewColumnsDef.meaning]; //list of selected column to be view (init with word's column)
  displayedColumns: string[]; //list of displaying column in the screen
  dataSource;//data source for rendering table
  pageSizeOptions: number[];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  constructor(public config: Config) { }

  ngOnInit() {
    this.dataset = this.getListOfDataset(); //get all dataset
    //this.viewColumns = this.getAllViewMode(); //get all view column
    this.selectedViewColumn = [
      this.config.viewColumnsDef.word,
      this.config.viewColumnsDef.meaning,
      this.config.viewColumnsDef.type,
      this.config.viewColumnsDef.pronun,
      this.config.viewColumnsDef.kanji,
      this.config.viewColumnsDef.chinaMeaning,
      this.config.viewColumnsDef.example,
      this.config.viewColumnsDef.title
    ];
    this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get displaying column
    this.dataSource = new MatTableDataSource<Word>(this.getWordDataWithDatasetId(this.selectedDataset));
    this.dataSource.paginator = this.paginator;
    this.pageSizeOptions = [20, 50, 100];
    if(this.dataSource.data.length > 100){
      this.pageSizeOptions.push(this.dataSource.data.length);
    }
  }

  /**
   * handle view column selection
   * @param event event
   */
  onViewModeChangeHandler(event){
    this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get display column
  }

   /**
   * handle event change dropdown list dataset
   * @param event event parameter
   */
  onChangeHandler(event){
    this.dataSource = new MatTableDataSource<Word>(this.getWordDataWithDatasetId(this.selectedDataset));
    this.dataSource.paginator = this.paginator;
    this.pageSizeOptions = [20, 50, 100];
    if(this.dataSource.data.length > 100){
      this.pageSizeOptions.push(this.dataSource.data.length);
    }
  }

  /** 
	 * Export data to txt file
	*/
	onExport(): void {
    var fileName:string = 'default';
    switch (this.selectedDataset) {
      case 1:
        fileName = this.config.dataSetFileName.duolingo;
        break;
      case 2:
        fileName = this.config.dataSetFileName.mimikara;
        break;
      case 3:
        fileName = this.config.dataSetFileName.minanoNihongo;
        break;
      case 4:
        fileName = this.config.dataSetFileName.collection;
        break;
      default:
        break;
    }
		var blob = new Blob(["module.exports = {wordData: " + JSON.stringify(this.dataSource.data) + "};"], { type: "text/plain;charset=utf-8" });	//convert to string and export
		saveAs(blob, fileName + ".js");	//save to txt file
  }
  
  /**
   * Get all dataset
   */
  private getListOfDataset():Option[] {
    //TODO (Next version): update by loading from database
    return [
      {value: 1, viewValue: 'Duolingo'},
      {value: 2, viewValue: 'Mimikara'},
      {value: 3, viewValue: 'Minano Nihongo'},
      {value: 4, viewValue: 'Collection'}
    ];;
  }
  /**
   * get all column could be view on screen
   */
  private getAllViewMode():Option[]{
    return [
      {value: this.config.viewColumnsDef.word, viewValue: this.config.viewColumns.word},
      {value: this.config.viewColumnsDef.type, viewValue: this.config.viewColumns.type},
      {value: this.config.viewColumnsDef.pronun, viewValue: this.config.viewColumns.pronun},
      {value: this.config.viewColumnsDef.kanji, viewValue: this.config.viewColumns.kanji},
      {value: this.config.viewColumnsDef.chinaMeaning, viewValue: this.config.viewColumns.chinaMeaning},
      {value: this.config.viewColumnsDef.meaning, viewValue: this.config.viewColumns.meaning},
      {value: this.config.viewColumnsDef.example, viewValue: this.config.viewColumns.example},
      {value: this.config.viewColumnsDef.title, viewValue: this.config.viewColumns.title}
      
    ];
  }

  /**
   * get all displaying column
   * @param selectedColumns list of selected view column
   */
  private getColumnDef(selectedColumns:number[]): string[]{
    let colDef: string[] = [];
    selectedColumns.forEach(element => {
      switch(element){
        case this.config.viewColumnsDef.word:
          colDef.push(this.config.viewColumns.word);
          break;
        case this.config.viewColumnsDef.type:
          colDef.push(this.config.viewColumns.type);
          break;
        case this.config.viewColumnsDef.pronun:
          colDef.push(this.config.viewColumns.pronun);
            break;
        case this.config.viewColumnsDef.kanji:
          colDef.push(this.config.viewColumns.kanji);
          break;
        case this.config.viewColumnsDef.chinaMeaning:
          colDef.push(this.config.viewColumns.chinaMeaning);
          break;
        case this.config.viewColumnsDef.meaning:
          colDef.push(this.config.viewColumns.meaning);
          break;
        case this.config.viewColumnsDef.example:
          colDef.push(this.config.viewColumns.example);
          break;
        case this.config.viewColumnsDef.title:
          colDef.push(this.config.viewColumns.title);
          break;
        default:
          break;
      }
    });
    return colDef;
  }

  /**
   * get words data source
   * @param datasetId dataset Id
   */
  private getWordDataWithDatasetId(datasetId: number): Word[] {
    let words: Word[];
    let fileName: string = '';
    switch (datasetId) {
      case 1:
        fileName = this.config.dataSetFileName.duolingo;
        break;
      case 2:
        fileName = this.config.dataSetFileName.mimikara;
        break;
      case 3:
        fileName = this.config.dataSetFileName.minanoNihongo;
        break;
      case 4:
        fileName = this.config.dataSetFileName.collection;
        break;
      default:
        break;
    }
    let sourceFile = require('src/dataset/' + fileName); //read file source
    words = sourceFile.wordData;
    return words;
  }
}
