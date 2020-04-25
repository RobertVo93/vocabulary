import { Component, OnInit } from '@angular/core';
import { Option } from 'src/app/interface/option';
import { PubSubService } from '../../services/data.service';
import { Config } from 'src/app/configuration/config';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  dataset: Option[];    //option for dropdownlist 'Dataset'
  selected:number = 0;  //selected dataset
  constructor(private data: PubSubService, private config: Config, public dialog:MatDialog) { }

  ngOnInit() {
    this.dataset = this.getListOfDataset(); //get all dataset
    //if we have dataset then
    if(this.dataset.length != 0){
      this.selected = this.dataset[0].value;  //initial the selected is the first one
      this.updateDataBaseOnSelectedDataset(this.selected);  //update the data source
    }
  }

  /**
   * handle event change dropdown list dataset
   * @param event event parameter
   */
  onChangeHandler(event){
    this.updateDataBaseOnSelectedDataset(this.selected);
  }

  /**
   * Get all dataset
   */
  getListOfDataset():Option[] {
    //TODO (Next version): update by loading from database
    return [
      {value: 1, viewValue: 'Duolingo'},
      {value: 2, viewValue: 'Mimikara'},
      {value: 3, viewValue: 'Minano Nihongo'},
      {value: 4, viewValue: 'Collection'}
    ];;
  }

  /**
   * Trigger update data
   * @param selectedDataset target dataset Id
   */
  updateDataBaseOnSelectedDataset(selectedDatasetID:number):any {
    this.data.sendData(this.config.pubSubKey.datasetId, selectedDatasetID);
  }
}
