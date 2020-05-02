import { RoleService } from './role.service';
import { Roles } from 'src/app/class/roles';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Option } from 'src/app/interface/option';
import { Config } from 'src/app/configuration/config';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatSelect } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from 'src/app/services/common.service';
import { CommonDialogComponent } from 'src/app/share-component/common-dialog/common-dialog.component';

@Component({
	selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
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
		public service: RoleService, public dialog: MatDialog) { }

	ngOnInit() {
		this.selectedViewColumn = [
			this.config.viewColumnsDef.select
			, this.config.viewColumnsDef.id
			, this.config.viewColumnsDef.name
		];
		this.actions = this.getAllActions();
		this.viewColumns = this.getAllViewMode(); //get all view column
		this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get displaying column
		this.selection = new SelectionModel<Roles>(true, []);
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
	 */
	private async getAllData() {
		let dataConverted = await this.service.getAllData();
		if(dataConverted){
			this.dataSource = new MatTableDataSource<Roles>(dataConverted);
			this.dataSource.paginator = this.paginator;
			this.dataSource.sort = this.sort;
			this.pageSizeOptions = [20, 50, 100];
			if (this.dataSource.data.length > 100) {
				this.pageSizeOptions.push(this.dataSource.data.length);
			}
		}
	}

	/**
	 * Handle create new record
	 */
	private createNew() {
		let data = new Roles();
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '500px',
			data: { 
				title: 'Create new role'
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
				this.service.createData(result.record).subscribe(
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
			if(result != null && result.returnAction == this.config.returnAction.update){
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


