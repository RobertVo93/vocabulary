import { Component, OnInit } from '@angular/core';
import { Option } from 'src/app/interface/option';
import { PubSubService } from 'src/app/services/data.service';
import { Word } from 'src/app/interface/word';
import { Config } from 'src/app/configuration/config';

@Component({
  selector: 'app-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.css']
})
export class RightComponent implements OnInit {
  viewColumns: Option[];  //list of column could be viewed
  selectedViewColumn: number[] = [this.config.viewColumnsDef.word, this.config.viewColumnsDef.meaning]; //list of selected column to be view (init with word's column)
  displayedColumns: string[]; //list of displaying column in the screen
  dataSource : Word[];  //data source for rendering table
  constructor(private data: PubSubService, public config: Config) { }

  ngOnInit() {
    this.viewColumns = this.getAllViewMode(); //get all view column
    this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get displaying column
    //create listener to listen any change of datasource
    this.data.getData(this.config.pubSubKey.dataTraining).subscribe(data => {
      this.dataSource = data;
    });
    this.data.getData(this.config.pubSubKey.currentTrainingWordIndex).subscribe(data => {
      if(this.dataSource[data] != null){
        this.dataSource[data].rowColor = this.config.color.bgTrainedRowColor;
      }
    });
  }

  /**
   * handle view column selection
   * @param event event
   */
  onViewModeChangeHandler(event){
    this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get display column
  }

  /**
   * event count number of trained words
   */
  onGetTotalTrained() {
    return this.dataSource.filter(t => t.rowColor == this.config.color.bgTrainedRowColor).length;
  }

  /**
   * get all column could be view on screen
   */
  getAllViewMode():Option[]{
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
}
