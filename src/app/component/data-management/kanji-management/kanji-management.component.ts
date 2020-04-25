import { Component, OnInit, ViewChild } from '@angular/core';
import { Option } from 'src/app/interface/option';
import { Kanji } from 'src/app/interface/kanji';
import { Config } from 'src/app/configuration/config';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-kanji-management',
  templateUrl: './kanji-management.component.html',
  styleUrls: ['./kanji-management.component.css']
})
export class KanjiManagementComponent implements OnInit {
  isAutoSave: boolean = false;         //flag check auto save updated record
  levels: Option[];                   //all level of JLPT N1,2,3,4,5
  viewColumns: Option[];              //list of column could be viewed
  selectedViewColumn: number[] = [];  //list of selected column to be view
  displayedColumns: string[];         //list of displaying column in the screen
  dataSource;                         //data source for rendering table
  pageSizeOptions: number[];          //list of page size option

  updatedRecords: Kanji[] = [];            //list of updated records need to save cookie
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(public config: Config, public common: CommonService) { }

  ngOnInit() {
    let scope = this;
    window.addEventListener('beforeunload', function (e) { 
      //handle event leave this page when close or reload
        if(scope.isAutoSave){
          e.preventDefault(); 
          e.returnValue = '';
        }
    }); 
    this.levels = [
      { value: 0, viewValue: 'None' }
      , { value: 1, viewValue: '1' }
      , { value: 2, viewValue: '2' }
      , { value: 3, viewValue: '3' }
      , { value: 4, viewValue: '4' }
      , { value: 5, viewValue: '5' }
    ];
    this.selectedViewColumn = [this.config.viewColumnsDef.word
      //,this.config.viewColumnsDef.meaning
      , this.config.viewColumnsDef.fullMeaning
      , this.config.viewColumnsDef.JLPTLevel
      //,this.config.viewColumnsDef.remember
      , this.config.viewColumnsDef.explain
      // ,this.config.viewColumnsDef.fullName
      // ,this.config.viewColumnsDef.lastModifiedDate
      //,this.config.viewColumnsDef.order
    ];
    this.viewColumns = this.getAllViewMode(); //get all view column
    this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get displaying column
    this.dataSource = new MatTableDataSource<Kanji>(this.getAllKanji());
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.pageSizeOptions = [20, 50, 100];
    if (this.dataSource.data.length > 100) {
      this.pageSizeOptions.push(this.dataSource.data.length);
    }
  }

  /**
   * 
   * @param el 
   * @param text 
   */
  onUpdate(el: Kanji, text: string) {
    if (text == null) { return; }
    // copy and mutate
    el.explain = text;
  }

  /**
   * on change object
   * @param ele element
   * @param viewColumns column definition string
   */
  onModelChanged(ele: any, viewColumns: string) {
    // if (this.isAutoSave) {
    //   let existedIndex = -1;
    //   for (var i = 0; i < this.updatedRecords.length; i++) {
    //     if (this.updatedRecords[i].order == ele.order && this.updatedRecords[i].lastModified == ele.lastModified) {
    //       this.updatedRecords[i] = ele;
    //       break;
    //     }
    //   }

    //   if (existedIndex == -1) {
    //     this.updatedRecords.push(ele);
    //   }
    // }
  }

  /**
   * filter by text
   * @param event 
   */
  onFilter(event: any) {
    if (event.which == 13) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
  }

  /**
   * handle view column selection
   * @param event event
   */
  onViewModeChangeHandler(event) {
    this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get display column
  }

  /**
   * get all column could be view on screen
   */
  private getAllViewMode(): Option[] {
    return [
      { value: this.config.viewColumnsDef.word, viewValue: this.config.viewColumns.word },
      { value: this.config.viewColumnsDef.meaning, viewValue: this.config.viewColumns.meaning },
      { value: this.config.viewColumnsDef.fullMeaning, viewValue: this.config.viewColumns.fullMeaning },
      { value: this.config.viewColumnsDef.remember, viewValue: this.config.viewColumns.remember },
      { value: this.config.viewColumnsDef.explain, viewValue: this.config.viewColumns.explain },
      { value: this.config.viewColumnsDef.JLPTLevel, viewValue: this.config.viewColumns.JLPTLevel },
      { value: this.config.viewColumnsDef.fullName, viewValue: this.config.viewColumns.fullName },
      { value: this.config.viewColumnsDef.lastModifiedDate, viewValue: this.config.viewColumns.lastModifiedDate },
      { value: this.config.viewColumnsDef.order, viewValue: this.config.viewColumns.order }
    ];
  }

  /**
   * get all displaying column
   * @param selectedColumns list of selected view column
   */
  private getColumnDef(selectedColumns: number[]): string[] {
    let colDef: string[] = [];
    selectedColumns.forEach(element => {
      switch (element) {
        case this.config.viewColumnsDef.word:
          colDef.push(this.config.viewColumns.word);
          break;
        case this.config.viewColumnsDef.meaning:
          colDef.push(this.config.viewColumns.meaning);
          break;
        case this.config.viewColumnsDef.fullMeaning:
          colDef.push(this.config.viewColumns.fullMeaning);
          break;
        case this.config.viewColumnsDef.fullName:
          colDef.push(this.config.viewColumns.fullName);
          break;
        case this.config.viewColumnsDef.lastModifiedDate:
          colDef.push(this.config.viewColumns.lastModifiedDate);
          break;
        case this.config.viewColumnsDef.order:
          colDef.push(this.config.viewColumns.order);
          break;
        case this.config.viewColumnsDef.remember:
          colDef.push(this.config.viewColumns.remember);
          break;
        case this.config.viewColumnsDef.explain:
          colDef.push(this.config.viewColumns.explain);
          break;
        case this.config.viewColumnsDef.JLPTLevel:
          colDef.push(this.config.viewColumns.JLPTLevel);
          break;
        default:
          break;
      }
    });
    return colDef;
  }
  /**
   * get kanjis data source
   * @param datasetId dataset Id
   */
  private getAllKanji(): Kanji[] {
    let kanji: Kanji[];
    let fileName: string = this.config.dataSetFileName.kanji;
    let sourceFile = require('src/dataset/' + fileName); //read file source
    kanji = sourceFile.wordData;
    for (var i = 0; i < kanji.length; i++) {
      kanji[i].order = i + 1;
    }
    return kanji;
  }

  /** 
	 * Export data to txt file
	*/
  onExport(): void {
    var blob = new Blob(["module.exports = {wordData: " + JSON.stringify(this.dataSource.data) + "};"], { type: "text/plain;charset=utf-8" });	//convert to string and export
    saveAs(blob, this.config.dataSetFileName.kanji + ".js");	//save to txt file
  }
}
