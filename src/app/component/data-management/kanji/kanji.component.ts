import { KanjiService } from './kanji.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Option } from 'src/app/interface/option';
import { Config } from 'src/app/configuration/config';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatSelect } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from 'src/app/services/common.service';
import { CommonDialogComponent } from 'src/app/share-component/common-dialog/common-dialog.component';
import { Kanjis } from 'src/app/class/kanjis';

@Component({
	selector: 'app-kanji',
	templateUrl: './kanji.component.html',
	styleUrls: ['./kanji.component.css']
})
export class KanjiComponent implements OnInit {
	serverImagesURL: string = '';		//url for image resources
	kanjiLevels: Option[];				//list of kanji level from n0-n5
	actions: Option[];					//list of action for selected rows
	viewColumns: Option[];              //list of column could be viewed
	selectedViewColumn: number[] = [];  //list of selected column to be view
	selectedAction: number;				//selected action for selected rows
	displayedColumns: string[];         //list of displaying column in the screen
	dataSource;                         //data source for rendering table
	selection;
	pageSizeOptions: number[];          //list of page size option

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	constructor(public config: Config, public common: CommonService,
		public service: KanjiService, public dialog: MatDialog) { }

	ngOnInit() {
		this.serverImagesURL = this.config.apiServiceURL.images;
		this.kanjiLevels = this.getListOfKanjiLevel();
		this.selectedViewColumn = [
			this.config.viewColumnsDef.select
			, this.config.viewColumnsDef.id
			, this.config.viewColumnsDef.word
			, this.config.viewColumnsDef.meaning
			, this.config.viewColumnsDef.JLPTLevel
			, this.config.viewColumnsDef.explain
		];
		this.actions = this.getAllActions();
		this.viewColumns = this.getAllViewMode(); //get all view column
		this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get displaying column
		this.selection = new SelectionModel<Kanjis>(true, []);
		this.getAllData();
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
	* 
	* @param el 
	* @param text 
	*/
   onUpdate(el: Kanjis, text: string) {
	 if (text == null) { return; }
	 // copy and mutate
	 el.explain = text;
   }

	/**
	 * Handle action selection
	 */
	onSelectionChange(event) {
		switch (this.selectedAction) {
			case this.config.optionValue.createNew:
				this.createNew();
				break;
			case this.config.optionValue.update:
				this.update();
				break;
			case this.config.optionValue.delete:
				this.delete();
				break;
			default:
				break;
		}
		const matSelect: MatSelect = event.source;
		matSelect.writeValue(null);
	}

	/**
	 * Check is all records selected
	 */
	onIsAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dataSource.data.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection.
	 */
	onMasterToggle() {
		this.onIsAllSelected() ?
			this.selection.clear() :
			this.dataSource.data.forEach(row => {
				this.selection.select(row)
			});
	}

	/**
	 * Get all form action [create, update, delete]
	 */
	private getAllActions(): Option[] {
		return [
			{ value: this.config.optionValue.createNew, viewValue: this.config.optionViewValue.createNew },
			{ value: this.config.optionValue.update, viewValue: this.config.optionViewValue.update },
			{ value: this.config.optionValue.delete, viewValue: this.config.optionViewValue.delete }
		];
	}

	/**
	 * Get all dataset
	 */
	private getListOfKanjiLevel(): Option[] {
		//TODO (Next version): update by loading from database
		let options: Option[] = [];
		for (var option in this.config.kanjiLevelOptions) {
			options.push({
				value: parseInt(option),
				viewValue: this.config.kanjiLevelOptions[option]
			})
		}
		return options.sort((a,b) => a.value - b.value);
	}

	/**
	 * get all column could be view on screen
	 */
	private getAllViewMode(): Option[] {
		return [
			{ value: this.config.viewColumnsDef.select, viewValue: this.config.viewColumns.select },
			{ value: this.config.viewColumnsDef.id, viewValue: this.config.viewColumns.id },
			{ value: this.config.viewColumnsDef.word, viewValue: this.config.viewColumns.word },
			{ value: this.config.viewColumnsDef.meaning, viewValue: this.config.viewColumns.meaning },
			{ value: this.config.viewColumnsDef.JLPTLevel, viewValue: this.config.viewColumns.JLPTLevel },
			{ value: this.config.viewColumnsDef.fullMeaning, viewValue: this.config.viewColumns.fullMeaning },
			{ value: this.config.viewColumnsDef.remember, viewValue: this.config.viewColumns.remember },
			{ value: this.config.viewColumnsDef.explain, viewValue: this.config.viewColumns.explain },
			{ value: this.config.viewColumnsDef.fullName, viewValue: this.config.viewColumns.fullName },
			{ value: this.config.viewColumnsDef.image, viewValue: this.config.viewColumns.image },
			{ value: this.config.viewColumnsDef.createdDate, viewValue: this.config.viewColumns.createdDate },
			{ value: this.config.viewColumnsDef.createdBy, viewValue: this.config.viewColumns.createdBy },
			{ value: this.config.viewColumnsDef.updatedDate, viewValue: this.config.viewColumns.updatedDate },
			{ value: this.config.viewColumnsDef.updatedBy, viewValue: this.config.viewColumns.updatedBy }
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
				case this.config.viewColumnsDef.select:
					colDef.push(this.config.viewColumns.select);
					break;
				case this.config.viewColumnsDef.id:
					colDef.push(this.config.viewColumns.id);
					break;
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
				case this.config.viewColumnsDef.remember:
					colDef.push(this.config.viewColumns.remember);
					break;
				case this.config.viewColumnsDef.explain:
					colDef.push(this.config.viewColumns.explain);
					break;
				case this.config.viewColumnsDef.JLPTLevel:
					colDef.push(this.config.viewColumns.JLPTLevel);
					break;
				case this.config.viewColumnsDef.image:
					colDef.push(this.config.viewColumns.image);
					break;
				case this.config.viewColumnsDef.createdDate:
					colDef.push(this.config.viewColumns.createdDate);
					break;
				case this.config.viewColumnsDef.createdBy:
					colDef.push(this.config.viewColumns.createdBy);
					break;
				case this.config.viewColumnsDef.updatedDate:
					colDef.push(this.config.viewColumns.updatedDate);
					break;
				case this.config.viewColumnsDef.updatedBy:
					colDef.push(this.config.viewColumns.updatedBy);
					break;
				default:
					break;
			}
		});
		return colDef;
	}
	/**
	 * get data source
	 * @param datasetId dataset Id
	 */
	private async getAllData() {
		let dataConverted = await this.service.getAllData();
		if (dataConverted) {
			this.dataSource = new MatTableDataSource<Kanjis>(dataConverted);
			this.dataSource.paginator = this.paginator;
			this.dataSource.sort = this.sort;
			this.pageSizeOptions = [20, 50, 100];
			if (this.dataSource.data.length > 100) {
				this.pageSizeOptions.push(this.dataSource.data.length);
			}
		}
	}

	/**
	 * Convert source obj to data
	 * @param obj source obj
	 */
	private convertToData(obj: any): Kanjis {
		let data = new Kanjis();
		for (var prop in obj) {
			data[prop] = obj[prop];
		}
		return data;
	}

	/**
	 * Convert list source obj to data
	 * @param obj list source obj
	 */
	private convertListData(obj): Kanjis[] {
		let data = [];
		for (var i = 0; i < obj.length; i++) {
			data.push(this.convertToData(obj[i]));
		}
		return data;
	}

	/**
	 * Handle create new record
	 */
	private createNew() {
		let data = new Kanjis();
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '500px',
			data: {
				title: 'Create new Kanji'
				, message: 'Please fill in the form'
				, record: data
				, questions: data.getQuestions()
				, action: {
					save: true,
					cancel: true
				}
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result != null && result.returnAction == this.config.returnAction.save) {
				this.service.createData([result.record]).subscribe(
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
		});
	}

	/**
	 * Handle update record
	 */
	private update() {
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '300px',
			data: {
				title: this.config.commonMessage.confirmation
				, message: this.config.commonMessage.updateRecordConfirmation
				, action: {
					update: true,
					cancel: true
				}
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			console.log(result);
			if (result != null && result.returnAction == this.config.returnAction.update) {
				this.service.updateData(this.selection._selected).subscribe(
					(res) => {
						this.dialog.open(CommonDialogComponent, {
							width: '300px',
							data: {
								title: this.config.commonMessage.notification
								, message: this.config.commonMessage.updateSuccessfull
								, action: {
									ok: true
								}
							}
						});
					},
					(err) => {
						console.log(err.statusText);
						this.dialog.open(CommonDialogComponent, {
							width: '300px',
							data: {
								title: this.config.commonMessage.alert
								, message: this.config.commonMessage.updateError
								, action: {
									ok: true
								}
							}
						});
					})
			}
		})
	}

	/**
	 * Handle delete record
	 */
	private delete() {
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '300px',
			data: {
				title: this.config.commonMessage.confirmation
				, message: this.config.commonMessage.deleteRecordConfirmation
				, record: null
				, action: {
					cancel: true,
					delete: true
				}
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			console.log(result);
			if (result != null && result.returnAction == this.config.returnAction.delete) {
				this.service.deleteBulkData(this.selection._selected).subscribe(
					(res) => {
						console.log(res);
						this.dialog.open(CommonDialogComponent, {
							width: '300px',
							data: {
								title: this.config.commonMessage.notification
								, message: this.config.commonMessage.deleteSuccessfull
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
								, message: this.config.commonMessage.deleteError
								, action: {
									ok: true
								}
							}
						});
					}
				);
			}
		});
	}
	
	/**Upload data from js file to Database */
	/**
	 * get words data source
	 * @param datasetId dataset Id
	 */
	private getWordDataWithDatasetId(): Kanjis[] {
		let words: Kanjis[];
		let fileName: string = this.config.dataSetFileName.kanji;
		let sourceFile = require('src/dataset/' + fileName); //read file source
		words = sourceFile.wordData;
		return words;
	}

	updateDataToDatabase() {
		const doulingo = this.getWordDataWithDatasetId();

		const dbData: Kanjis[] = [];
		//doulingo
		for (var i = 0; i < doulingo.length; i++) {
			var words: Kanjis = new Kanjis(doulingo[i]);
			dbData.push(words);
		}
		this.service.createData(dbData).subscribe(
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
}


