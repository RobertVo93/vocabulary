import { WordService } from './word.service';
import { Option } from 'src/app/interface/option';
import { Config } from 'src/app/configuration/config';
import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {merge, fromEvent} from "rxjs";
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import { MatPaginator, MatSort, MatDialog, MatSelect } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from 'src/app/services/common.service';
import { CommonDialogComponent } from 'src/app/share-component/common-dialog/common-dialog.component';
import { LanguageService } from '../language/language.service';
import { Words } from 'src/app/class/words';
import { TagsService } from '../tag/tags.service';
import { DataSourcesService } from '../data-sources/data-sources.service'; 
import { AlertService } from 'src/app/services/alert.service';
import { Kanjis } from 'src/app/class/kanjis';
import { KanjiService } from '../kanji/kanji.service';
import { UserSetting } from 'src/app/class/userSetting';
import { UserSettingService } from 'src/app/services/user-setting.service';
import { WordsDataSource } from 'src/app/services/mat-table/words.datasource';


@Component({
	selector: 'app-word',
	templateUrl: './word.component.html',
	styleUrls: ['./word.component.css']
})
export class WordComponent implements OnInit, AfterViewInit {
	serverImagesURL: string = '';		//url for image resources
	searchWord: string = '';			//search keyword
	selectedDatasource: any;  			//selected data set Id
	languages: Option[];				//list of languages options
	filteredLanguages: Option[];		//list of filtered languages options
	tags: Option[];						//list of tags options
	filteredTags: Option[];				//list of filtered tags options
	dataSources: Option[];				//list of data sources options
	filteredDataSources: Option[];		//list of filtered data sources options
	types: Option[];					//list of word type
	actions: Option[];					//list of action for selected rows
	viewColumns: Option[];              //list of column could be viewed
	selectedViewColumn: number[] = [];  //list of selected column to be view
	selectedAction: number;				//selected action for selected rows
	displayedColumns: string[];         //list of displaying column in the screen
	selection;
	pageSizeOptions: number[];          //list of page size option
	kanjis: Kanjis[];					//list of all kanji available in system
	currentUserSetting: UserSetting;
	dataSource: WordsDataSource;		//data sources for table

    @ViewChild('input', { static: true }) input: ElementRef;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	constructor(public config: Config, public common: CommonService, public service: WordService, public dialog: MatDialog, private kanjiService: KanjiService
		, private langService: LanguageService, private dataSourceService: DataSourcesService, private tagService: TagsService, private alertService: AlertService
		, private setting: UserSettingService) { }

	ngOnInit() {
		this.pageSizeOptions = [20, 50, 100];
		this.paginator.pageIndex = 0;
		this.paginator.pageSize = 50;
		this.dataSource = new WordsDataSource(this.service);
		this.serverImagesURL = this.config.apiServiceURL.images;
		let promises = [
			this.setupAllLanguageOptions(),
			this.setupAllTagOptions(),
			this.setupAllDataSourceOptions(),
			this.getAllKanjis(),
			this.getUserSetting()
		];
		Promise.all(promises).then(() => {
			//get user setting
			let userSetting = this.common.getUserSettingForPage(this.currentUserSetting, this.config.userSettingKey.page.wordManagement);
			this.selectedViewColumn = userSetting.selectedViewColumn
				? userSetting.selectedViewColumn :
				[
					this.config.viewColumnsDef.select
					, this.config.viewColumnsDef.id
					, this.config.viewColumnsDef.word
					, this.config.viewColumnsDef.kanji
					, this.config.viewColumnsDef.meaning
				];
			this.selectedDatasource = userSetting.selectedDatasource
				? userSetting.selectedDatasource : this.dataSources[0].value;
			this.searchWord = userSetting.searchWord;

			this.loadWordsPage();
			this.actions = this.getAllActions();
			this.types = this.getAllWordTypes();
			this.viewColumns = this.getAllViewMode(); //get all view column
			this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get displaying column
			this.selection = new SelectionModel<Words>(true, []);

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
						this.loadWordsPage();
						this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordManagement, this.config.userSettingKey.searchWord, e['target'].value);
						this.setting.updateData([this.currentUserSetting]);
						this.paginator.pageIndex = 0;
					}
                })
            )
            .subscribe();
		//subscribe paging
        merge(this.sort.sortChange, this.paginator.page)
        .pipe(
            tap(() => this.loadWordsPage())
        )
        .subscribe();

	}
	
	/**
	 * Loading word selected page
	 */
	loadWordsPage() {
        this.dataSource.loadWords(
            this.selectedDatasource,
			this.input.nativeElement.value,
			this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

	/**
   * handle event change dropdown list dataset
   * @param event event parameter
   */
	onChangeHandler(event) {
		this.loadWordsPage();
		this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordManagement, this.config.userSettingKey.selectedDatasource, this.selectedDatasource);
		this.setting.updateData([this.currentUserSetting]);
	}

	/**
	 * handle view column selection
	 * @param event event
	 */
	onViewModeChangeHandler(event) {
		this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get display column
		this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordManagement, this.config.userSettingKey.selectedViewColumn, this.selectedViewColumn);
		this.setting.updateData([this.currentUserSetting]);
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
		const numRows = this.dataSource.getWords().length;
		return numSelected === numRows;
	}

	onUpdateKanji(ele: Words, event) {
		console.log(event);
		ele.kanjiExplain = this.common.getKanjiIds(event, this.kanjis);
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection.
	 */
	onMasterToggle() {
		this.onIsAllSelected() ?
			this.selection.clear() :
			this.dataSource.getWords().forEach(row => {
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
	 * setup the type of words
	 */
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
			{ value: this.config.viewColumnsDef.title, viewValue: this.config.viewColumns.title },
			{ value: this.config.viewColumnsDef.exampleMeaning, viewValue: this.config.viewColumns.exampleMeaning },
			{ value: this.config.viewColumnsDef.kanjiExplain, viewValue: this.config.viewColumns.kanjiExplain },
			{ value: this.config.viewColumnsDef.chinaMeaning, viewValue: this.config.viewColumns.chinaMeaning },
			{ value: this.config.viewColumnsDef.language, viewValue: this.config.viewColumns.language },
			{ value: this.config.viewColumnsDef.dataSource, viewValue: this.config.viewColumns.dataSource },
			{ value: this.config.viewColumnsDef.tags, viewValue: this.config.viewColumns.tags },
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
				case this.config.viewColumnsDef.kanjiExplain:
					colDef.push(this.config.viewColumns.kanjiExplain);
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
				case this.config.viewColumnsDef.title:
					colDef.push(this.config.viewColumns.title);
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
	 * get all kanjis
	 */
	private async getAllKanjis() {
		let dataConverted = await this.kanjiService.getAllData();
		if (dataConverted) {
			this.kanjis = dataConverted;
		}
	}

	/**
	 * Get user setting
	 */
	private async getUserSetting() {
		this.currentUserSetting = await this.setting.getUserSetting();
	}

	/**
	 * set up the languages
	 */
	private async setupAllLanguageOptions() {
		let options: Option[] = [];
		let language = await this.langService.getAllData();
		for (var i = 0; i < language.length; i++) {
			options.push({ value: language[i]._id, viewValue: language[i].name })
		}
		this.languages = options;
		this.filteredLanguages = options;
	}

	/**
	 * set up the tags
	 */
	private async setupAllTagOptions() {
		let options: Option[] = [];
		let tags = await this.tagService.getAllData();
		for (var i = 0; i < tags.length; i++) {
			options.push({ value: tags[i]._id, viewValue: tags[i].name })
		}
		this.tags = options;
		this.filteredTags = options;
	}

	/**
	 * set up the data sources
	 */
	private async setupAllDataSourceOptions() {
		let options: Option[] = [];
		options.push({ value: -1, viewValue: this.config.defaultDropDownOptions['-1'] });	//--All--
		options.push({ value: 0, viewValue: this.config.defaultDropDownOptions['0'] });		//--None--
		let dataSources = await this.dataSourceService.getAllData();
		for (var i = 0; i < dataSources.length; i++) {
			options.push({ value: dataSources[i]._id, viewValue: dataSources[i].name })
		}
		this.dataSources = options;
		this.filteredDataSources = options;
	}

	/**
	 * Handle create new record
	 */
	private async createNew() {
		let data = new Words();
		let questions = await data.getQuestions(this.langService, this.dataSourceService, this.tagService, this.common, this.config, this.kanjis);
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '80vw',
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
				result.record.kanjiExplain = this.common.getKanjiIds(result.record.kanji, this.kanjis);
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
		let data = new Words(this.selection._selected[0]);
		let questions = await data.getQuestions(this.langService, this.dataSourceService, this.tagService, this.common, this.config, this.kanjis);
		const dialogRef = this.dialog.open(CommonDialogComponent, {
			width: '80vw',
			data: { 
				title: 'Edit word'
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
				result.record.kanjiExplain = this.common.getKanjiIds(result.record.kanji, this.kanjis);
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
}

