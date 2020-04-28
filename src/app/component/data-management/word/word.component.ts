import { WordService } from './word.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Option } from 'src/app/interface/option';
import { Config } from 'src/app/configuration/config';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatSelect } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from 'src/app/services/common.service';
import { CommonDialogComponent } from 'src/app/share-component/common-dialog/common-dialog.component';
import { LanguageService } from '../language/language.service';
import { Words } from 'src/app/class/words';
import { TagsService } from '../tag-management/tags.service';
import { DataSourcesService } from '../data-sources/data-sources.service';

@Component({
	selector: 'app-word',
	templateUrl: './word.component.html',
	styleUrls: ['./word.component.css']
})
export class WordComponent implements OnInit {
	selectedDatasource: any;  //selected data set Id
	languages: Option[];				//list of languages options
	tags: Option[];						//list of roles options
	dataSources: Option[];				//list of data sources options
	types: Option[];					//list of word type
	actions: Option[];					//list of action for selected rows
	viewColumns: Option[];              //list of column could be viewed
	selectedViewColumn: number[] = [];  //list of selected column to be view
	selectedAction: number;				//selected action for selected rows
	displayedColumns: string[];         //list of displaying column in the screen
	dataSource;                         //data source for rendering table
	dataSourceAll: Words[];				//all datasource
	selection;
	pageSizeOptions: number[];          //list of page size option

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	constructor(public config: Config, public common: CommonService, public service: WordService, public dialog: MatDialog
		, private langService: LanguageService, private dataSourceService: DataSourcesService, private tagService: TagsService) { }

	ngOnInit() {
		this.selectedViewColumn = [
			this.config.viewColumnsDef.select
			, this.config.viewColumnsDef.id
			, this.config.viewColumnsDef.word
			, this.config.viewColumnsDef.kanji
			, this.config.viewColumnsDef.type
			, this.config.viewColumnsDef.pronun
			, this.config.viewColumnsDef.meaning
			, this.config.viewColumnsDef.example
			, this.config.viewColumnsDef.exampleMeaning
			, this.config.viewColumnsDef.kanjiExplain
			, this.config.viewColumnsDef.chinaMeaning
			, this.config.viewColumnsDef.language
			, this.config.viewColumnsDef.dataSource
			, this.config.viewColumnsDef.tags
		];
		this.actions = this.getAllActions();
		this.types = this.getAllWordTypes();
		this.setupAllLanguageOptions();
		this.setupAllTagOptions();
		this.setupAllDataSourceOptions();
		this.viewColumns = this.getAllViewMode(); //get all view column
		this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get displaying column
		this.selection = new SelectionModel<Words>(true, []);
		this.getAllData();
	}

	/**
   * handle event change dropdown list dataset
   * @param event event parameter
   */
	onChangeHandler(event) {
		this.getWordByDataSourceFilter(this.selectedDatasource);
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
	 * Get all words by selected data source
	 * @param source_id data source _id
	 */
	private getWordByDataSourceFilter(source_id: any){
		let data = this.dataSourceAll.filter((value) =>{
			return value.dataSource == source_id;
		})
		this.dataSource = new MatTableDataSource<Words>(data);
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
		this.pageSizeOptions = [20, 50, 100];
		if (this.dataSource.data.length > 100) {
			this.pageSizeOptions.push(this.dataSource.data.length);
		}
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

	private getAllWordTypes(): Option[] {
		let options: Option[] = [];
		for (var option in this.config.wordType) {
			options.push({
				value: parseInt(option),
				viewValue: this.config.wordType[option]
			})
		}
		return options;
	}
	/**
	 * get all column could be view on screen
	 */
	private getAllViewMode(): Option[] {
		return [
			{ value: this.config.viewColumnsDef.select, viewValue: this.config.viewColumns.select },
			{ value: this.config.viewColumnsDef.id, viewValue: this.config.viewColumns.id },
			{ value: this.config.viewColumnsDef.word, viewValue: this.config.viewColumns.word },
			{ value: this.config.viewColumnsDef.kanji, viewValue: this.config.viewColumns.kanji },
			{ value: this.config.viewColumnsDef.type, viewValue: this.config.viewColumns.type },
			{ value: this.config.viewColumnsDef.pronun, viewValue: this.config.viewColumns.pronun },
			{ value: this.config.viewColumnsDef.meaning, viewValue: this.config.viewColumns.meaning },
			{ value: this.config.viewColumnsDef.example, viewValue: this.config.viewColumns.example },
			{ value: this.config.viewColumnsDef.exampleMeaning, viewValue: this.config.viewColumns.exampleMeaning },
			{ value: this.config.viewColumnsDef.kanjiExplain, viewValue: this.config.viewColumns.kanjiExplain },
			{ value: this.config.viewColumnsDef.chinaMeaning, viewValue: this.config.viewColumns.chinaMeaning },
			{ value: this.config.viewColumnsDef.language, viewValue: this.config.viewColumns.language },
			{ value: this.config.viewColumnsDef.dataSource, viewValue: this.config.viewColumns.dataSource },
			{ value: this.config.viewColumnsDef.tags, viewValue: this.config.viewColumns.tags },
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
				case this.config.viewColumnsDef.kanji:
					colDef.push(this.config.viewColumns.kanji);
					break;
				case this.config.viewColumnsDef.type:
					colDef.push(this.config.viewColumns.type);
					break;
				case this.config.viewColumnsDef.pronun:
					colDef.push(this.config.viewColumns.pronun);
					break;
				case this.config.viewColumnsDef.meaning:
					colDef.push(this.config.viewColumns.meaning);
					break;
				case this.config.viewColumnsDef.example:
					colDef.push(this.config.viewColumns.example);
					break;
				case this.config.viewColumnsDef.exampleMeaning:
					colDef.push(this.config.viewColumns.exampleMeaning);
					break;
				case this.config.viewColumnsDef.chinaMeaning:
					colDef.push(this.config.viewColumns.chinaMeaning);
					break;
				case this.config.viewColumnsDef.language:
					colDef.push(this.config.viewColumns.language);
					break;
				case this.config.viewColumnsDef.dataSource:
					colDef.push(this.config.viewColumns.dataSource);
					break;
				case this.config.viewColumnsDef.tags:
					colDef.push(this.config.viewColumns.tags);
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
	 */
	private async getAllData() {
		let dataConverted = await this.service.getAllData();
		if (dataConverted) {
			this.dataSourceAll = dataConverted
		}
	}

	private async setupAllLanguageOptions() {
		let options: Option[] = [];
		let language = await this.langService.getAllData();
		for (var i = 0; i < language.length; i++) {
			options.push({ value: language[i]._id, viewValue: language[i].name })
		}
		this.languages = options;
	}

	private async setupAllTagOptions() {
		let options: Option[] = [];
		let tags = await this.tagService.getAllData();
		for (var i = 0; i < tags.length; i++) {
			options.push({ value: tags[i]._id, viewValue: tags[i].name })
		}
		this.tags = options;
	}

	private async setupAllDataSourceOptions() {
		let options: Option[] = [];
		let dataSources = await this.dataSourceService.getAllData();
		for (var i = 0; i < dataSources.length; i++) {
			options.push({ value: dataSources[i]._id, viewValue: dataSources[i].name })
		}
		this.dataSources = options;
	}

	/**
	 * Handle create new record
	 */
	private async createNew() {
		let data = new Words();
		let questions = await data.getQuestions(this.langService, this.dataSourceService, this.tagService);
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '800px',
			data: {
				title: 'Create new word'
				, message: 'Please fill in the form'
				, record: data
				, questions: questions
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
}
