import { KanjiService } from './kanji.service';
import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {merge, fromEvent} from "rxjs";
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import { Option } from 'src/app/interface/option';
import { Config } from 'src/app/configuration/config';
import { MatPaginator, MatSort, MatDialog, MatSelect } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from 'src/app/services/common.service';
import { CommonDialogComponent } from 'src/app/share-component/common-dialog/common-dialog.component';
import { Kanjis } from 'src/app/class/kanjis';
import { AlertService } from 'src/app/services/alert.service';
import { UserSetting } from 'src/app/class/userSetting';
import { UserSettingService } from 'src/app/services/user-setting.service';
import { TagsService } from '../tag/tags.service';
import { Words } from 'src/app/class/words';
import { WordService } from '../word/word.service';
import { KanjisDataSource } from 'src/app/services/mat-table/kanjis.datasource';

@Component({
	selector: 'app-kanji',
	templateUrl: './kanji.component.html',
	styleUrls: ['./kanji.component.css']
})
export class KanjiComponent implements OnInit, AfterViewInit {
	searchWord: string = '';			//search keyword
	serverImagesURL: string = '';		//url for image resources
	kanjiLevels: Option[];				//list of kanji level from n0-n5
	actions: Option[];					//list of action for selected rows
	viewColumns: Option[];              //list of column could be viewed
	selectedViewColumn: number[] = [];  //list of selected column to be view
	selectedAction: number;				//selected action for selected rows
	displayedColumns: string[];         //list of displaying column in the screen
	selection;
	pageSizeOptions: number[];          //list of page size option
	allOriginalKanji: Kanjis[];					//all original kanji
	currentUserSetting: UserSetting;	//user setting
	allWords: Words[];					//all current words
	dataSources: KanjisDataSource;		//data sources for table
    @ViewChild('input', { static: true }) input: ElementRef;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	constructor(public config: Config, public common: CommonService, private setting: UserSettingService, private tagService: TagsService, 
		public service: KanjiService, public dialog: MatDialog, private alertService: AlertService, private wordService: WordService) { }

	ngOnInit() {
		this.pageSizeOptions = [20, 50, 100];
		this.paginator.pageIndex = 0;
		this.paginator.pageSize = 50;
		this.dataSources = new KanjisDataSource(this.service);
		this.serverImagesURL = this.config.apiServiceURL.images;
		let promises = [
			this.getAllWords(),
			this.getUserSetting(),
			this.loadKanjisPage()
		];
		Promise.all(promises).then(()=> {
			//get user setting
			let userSetting = this.common.getUserSettingForPage(this.currentUserSetting, this.config.userSettingKey.page.kanjiManagement);
			this.selectedViewColumn = userSetting.selectedViewColumn
				? userSetting.selectedViewColumn :
				[
					this.config.viewColumnsDef.select
					, this.config.viewColumnsDef.id
					, this.config.viewColumnsDef.kanji
					, this.config.viewColumnsDef.word
					, this.config.viewColumnsDef.meaning
					, this.config.viewColumnsDef.remember
					, this.config.viewColumnsDef.explain
				];
			this.searchWord = userSetting.searchWord;

			this.kanjiLevels = this.getListOfKanjiLevel();
			this.actions = this.getAllActions();
			this.viewColumns = this.getAllViewMode(); //get all view column
			this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get displaying column
			this.selection = new SelectionModel<Kanjis>(true, []);

			//fire search keyword
			if (userSetting.searchWord) {
				var e = new KeyboardEvent("keyup", { code: "Enter" });
				document.getElementById("searchWord").dispatchEvent(e);
			}
		});
	}

	ngAfterViewInit() {
		//subscribe sorting
		this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
		//subscribe filtering
        fromEvent(this.input.nativeElement,'keyup')
            .pipe(
                debounceTime(150),
                distinctUntilChanged(),
                tap((e) => {
					if (e['which'] == 13 || e['code'] == "Enter") {
						this.loadKanjisPage();
						this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.kanjiManagement, this.config.userSettingKey.searchWord, e['target'].value);
						this.setting.updateData([this.currentUserSetting]);
						this.paginator.pageIndex = 0;
					}
                })
            )
            .subscribe();
		//subscribe paging
        merge(this.sort.sortChange, this.paginator.page)
        .pipe(
            tap(() => this.loadKanjisPage())
        )
        .subscribe();

	}
	
	/**
	 * Loading kanji selected page
	 */
	loadKanjisPage() {
        this.dataSources.loadKanjis(
            -1,
			this.input.nativeElement.value,
			this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

	/**
	 * handle view column selection
	 * @param event event
	 */
	onViewModeChangeHandler(event) {
		this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get display column
		this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.kanjiManagement, this.config.userSettingKey.selectedViewColumn, this.selectedViewColumn);
		this.setting.updateData([this.currentUserSetting]);
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
		const numRows = this.dataSources.getKanjis().length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection.
	 */
	onMasterToggle() {
		this.onIsAllSelected() ?
			this.selection.clear() :
			this.dataSources.getKanjis().forEach(row => {
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
	 * Get all updated data in DB
	 */
	async onGetUpdatedData(){
		await this.service.forceGetAllDataBase();
	}

	/**
	 * Update related words
	 */
	onUpdateRelatedWords(){
		this.allOriginalKanji.forEach((kanji, index)=> {
			let filteredWord = this.allWords.filter((val)=>{
				return val.kanji.indexOf(kanji.kanji) != -1;
			});
			if(filteredWord.length != 0){
				let relatedWordsTableHTML = `
				<table style="background-color:rgb(255, 255, 255);border-left:1px solid rgb(239, 238, 238);border-right:1px solid rgb(239, 238, 238);">
					<tbody>
					${
						filteredWord.map((value)=> (
						`
						<tr>
							<td style="border-right:1px solid rgb(239, 238, 238);border-top:1px solid rgb(221, 221, 221);padding:4px !important;vertical-align:top;width:183.333px;">${value.kanji}</td>
							<td style="border-right:1px solid rgb(239, 238, 238);border-top:1px solid rgb(221, 221, 221);padding:4px !important;vertical-align:top;width:183.333px;">${value.word}</td>
							<td style="border-right:1px solid rgb(239, 238, 238);border-top:1px solid rgb(221, 221, 221);padding:4px !important;vertical-align:top;width:183.333px;">${value.chinaMeaning}</td>
							<td style="border-top:1px solid rgb(221, 221, 221);padding:4px !important;vertical-align:top;width:183.333px;">${value.meaning}</td>
						</tr>
						`
						))
					}
					</tbody>
				</table>`;
				kanji.relatedWords = relatedWordsTableHTML;
			}
		});
		this.service.updateData(this.allOriginalKanji).toPromise();
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
			{ value: this.config.viewColumnsDef.kanji, viewValue: this.config.viewColumns.kanji },
			{ value: this.config.viewColumnsDef.JLPTLevel, viewValue: this.config.viewColumns.JLPTLevel },
			{ value: this.config.viewColumnsDef.remember, viewValue: this.config.viewColumns.remember },
			{ value: this.config.viewColumnsDef.explain, viewValue: this.config.viewColumns.explain },
			{ value: this.config.viewColumnsDef.image, viewValue: this.config.viewColumns.image },
			{ value: this.config.viewColumnsDef.createdDate, viewValue: this.config.viewColumns.createdDate },
			{ value: this.config.viewColumnsDef.createdBy, viewValue: this.config.viewColumns.createdBy },
			{ value: this.config.viewColumnsDef.modifiedDate, viewValue: this.config.viewColumns.modifiedDate },
			{ value: this.config.viewColumnsDef.modifiedBy, viewValue: this.config.viewColumns.modifiedBy }
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
				case this.config.viewColumnsDef.meaning:
					colDef.push(this.config.viewColumns.meaning);
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
				case this.config.viewColumnsDef.modifiedDate:
					colDef.push(this.config.viewColumns.modifiedDate);
					break;
				case this.config.viewColumnsDef.modifiedBy:
					colDef.push(this.config.viewColumns.modifiedBy);
					break;
				default:
					break;
			}
		});
		return colDef;
	}

	/**
	 * get all words
	 */
	private async getAllWords() {
		this.allWords = await this.wordService.getAllData();
	}

	/**
	 * Get user setting
	 */
	private async getUserSetting() {
		this.currentUserSetting= await this.setting.getUserSetting();
	}

	/**
	 * Handle create new record
	 */
	private async createNew() {
		let data = new Kanjis();
		let questions = await data.getQuestions(this.common, this.config, this.allOriginalKanji, this.tagService, this.allWords);
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '80vw',
			data: {
				title: 'Create new Kanji'
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
				result.record.mark = 0;
				this.service.createData([result.record]).subscribe(
					(res) => {
						location.reload();
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
		let data = new Kanjis(this.selection._selected[0]);
		let questions = await data.getQuestions(this.common, this.config, this.allOriginalKanji, this.tagService, this.allWords);
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '80vw',
			data: { 
				title: 'Edit kanji'
				,message: 'Please fill in the form' 
				,record: data
				,questions: questions 
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
			if (result != null && result.returnAction == this.config.returnAction.update) {
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
						location.reload();
					},
					(err) => {
						this.alertService.error(this.config.commonMessage.deleteError);
					}
				);
			}
		});
	}
	
	/**Upload data from js file to Database */
	cloneDataToDatabase = false;
	//cloneDataToDatabase = true;
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
				location.reload();
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


