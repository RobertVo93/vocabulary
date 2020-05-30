
import { TagsService } from './tags.service';
import { Tags } from 'src/app/class/tags';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Option } from 'src/app/interface/option';
import { Config } from 'src/app/configuration/config';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatSelect } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from 'src/app/services/common.service';
import { CommonDialogComponent } from 'src/app/share-component/common-dialog/common-dialog.component';
import { AlertService } from 'src/app/services/alert.service';
import { UserSetting } from 'src/app/class/userSetting';
import { UserSettingService } from 'src/app/services/user-setting.service';

@Component({
	selector: 'app-tags',
	templateUrl: './tags.component.html',
	styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
	searchWord: string = '';			//search keyword
	actions: Option[];					//list of action for selected rows
	viewColumns: Option[];              //list of column could be viewed
	selectedViewColumn: number[] = [];  //list of selected column to be view
	selectedAction: number;				//selected action for selected rows
	displayedColumns: string[];         //list of displaying column in the screen
	dataSource;                         //data source for rendering table
	selection;
	pageSizeOptions: number[];          //list of page size option
	currentUserSetting: UserSetting;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	constructor(public config: Config, public common: CommonService, private setting: UserSettingService,
		public service: TagsService, public dialog: MatDialog, private alertService: AlertService) { }

	ngOnInit() {
		let promises = [
			this.getAllData(),
			this.getUserSetting()
		];
		Promise.all(promises).then(()=>{
			//get user setting
			let userSetting = this.common.getUserSettingForPage(this.currentUserSetting, this.config.userSettingKey.page.tagManagement);
			this.selectedViewColumn = userSetting.selectedViewColumn
				? userSetting.selectedViewColumn :
				[
					this.config.viewColumnsDef.select
					, this.config.viewColumnsDef.id
					, this.config.viewColumnsDef.name
				];
			this.searchWord = userSetting.searchWord;
			
			this.actions = this.getAllActions();
			this.viewColumns = this.getAllViewMode(); //get all view column
			this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get displaying column
			this.selection = new SelectionModel<Tags>(true, []);

			//fire search keyword
			if (this.searchWord) {
				var e = new KeyboardEvent("keyup", { code: "Enter" });
				document.getElementById("searchWord").dispatchEvent(e);
			}
		});
	}

	/**
	 * filter by text
	 * @param event 
	 */
	onFilter(event: any) {
		if ((event.which == 13 || event.code == "Enter") && this.searchWord != null) {
			this.dataSource.filter = this.searchWord.trim().toLowerCase();
			this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.tagManagement, this.config.userSettingKey.searchWord, this.searchWord);
			this.setting.updateData([this.currentUserSetting]).toPromise();
		}
	}

	/**
	 * handle view column selection
	 * @param event event
	 */
	onViewModeChangeHandler(event) {
		this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get display column
		this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.tagManagement, this.config.userSettingKey.selectedViewColumn, this.selectedViewColumn);
		this.setting.updateData([this.currentUserSetting]).toPromise();
	}

	/**
	 * Handle action selection
	 */
	onSelectionChange(event) {
		switch (this.selectedAction) {
			case this.config.optionValue.createNew:
				this.createNew();
				break;
			case this.config.optionValue.edit:
				this.editRecord();
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
	 * detect option is disable or not
	 * @param action action's option
	 */
	onDisableAction(action){
		return this.common.getActionOptionDisabled(action, this.selection._selected);
	}

	/**
	 * Get all form action [create, update, delete]
	 */
	private getAllActions(): Option[] {
		return [
			{ value: this.config.optionValue.createNew, viewValue: this.config.optionViewValue.createNew },
			{ value: this.config.optionValue.edit, viewValue: this.config.optionViewValue.edit },
			{ value: this.config.optionValue.update, viewValue: this.config.optionViewValue.update },
			{ value: this.config.optionValue.delete, viewValue: this.config.optionViewValue.delete }
		];
	}

	/**
	 * get all column could be view on screen
	 */
	private getAllViewMode(): Option[] {
		return [
			{ value: this.config.viewColumnsDef.select, viewValue: this.config.viewColumns.select },
			{ value: this.config.viewColumnsDef.id, viewValue: this.config.viewColumns.id },
			{ value: this.config.viewColumnsDef.name, viewValue: this.config.viewColumns.name },
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
				case this.config.viewColumnsDef.name:
					colDef.push(this.config.viewColumns.name);
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
		if(dataConverted){
			this.dataSource = new MatTableDataSource<Tags>(dataConverted);
			this.dataSource.paginator = this.paginator;
			this.dataSource.sort = this.sort;
			this.pageSizeOptions = [20, 50, 100];
			if (this.dataSource.data.length > 100) {
				this.pageSizeOptions.push(this.dataSource.data.length);
			}
		}
	}

	/**
	 * Get user setting
	 */
	private async getUserSetting() {
		this.currentUserSetting = await this.setting.getUserSetting();
	}

	/**
	 * Handle create new record
	 */
	private createNew() {
		let tag = new Tags();
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '500px',
			data: { 
				title: 'Create new tag'
				,message: 'Please provide the name of tag' 
				,record: tag
				,questions: tag.getQuestions() 
				,action: {
					save: true,
					cancel: true
				}
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if(result != null && result.returnAction == this.config.returnAction.save){
				this.service.createTag(result.record).subscribe(
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
						this.alertService.error(this.config.commonMessage.createError);
					}
				)
			}
		});
	}
	
	/**
	 * Handle edit record
	 */
	private async editRecord(){
		let data = new Tags(this.selection._selected[0]);
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '500px',
			data: { 
				title: 'Edit tag'
				,message: 'Please fill in the form' 
				,record: data
				,questions: data.getQuestions() 
				,action: {
					save: true,
					cancel: true
				}
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if(result != null && result.returnAction == this.config.returnAction.save){
				this.service.updateData([result.record]).subscribe(
					(res) => {
						this.alertService.success(this.config.commonMessage.updateSuccessfull);
						location.reload();
					},
					(err) => {
						this.alertService.error(this.config.commonMessage.updateError);
					});
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
			if(result != null && result.returnAction == this.config.returnAction.update){
				this.service.updateData(this.selection._selected).subscribe(
				(res) => {
					this.alertService.success(this.config.commonMessage.updateSuccessfull);
				},
				(err) => {
					this.alertService.error(this.config.commonMessage.updateError);
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
				,message: this.config.commonMessage.deleteRecordConfirmation 
				,record: null 
				,action: {
					cancel: true,
					delete: true
				} 
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			console.log(result);
			if(result != null && result.returnAction == this.config.returnAction.delete){
				this.service.deleteBulkTag(this.selection._selected).subscribe(
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
						this.alertService.error(this.config.commonMessage.deleteError);
					}
				);
			}
		});
	}
}
