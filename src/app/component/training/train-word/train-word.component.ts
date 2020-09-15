import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Option } from 'src/app/interface/option';
import { CommonService } from 'src/app/services/common.service';
import { WordEnum } from 'src/app/configuration/enums';
import { Config } from 'src/app/configuration/config';
import { WordService } from '../../data-management/word/word.service';
import { Words } from 'src/app/class/words';
import { DataSourcesService } from '../../data-management/data-sources/data-sources.service';
import { UserSetting } from 'src/app/class/userSetting';
import { UserSettingService } from 'src/app/services/user-setting.service';
import { TagsService } from '../../data-management/tag/tags.service';
import { Tags } from 'src/app/class/tags';
import { KeyValue } from '@angular/common';
import { SettingDialog } from 'src/app/share-component/setting-dialog/setting-dialog.component';

const numberOfCard = 4;	//Define the number of training card

@Component({
	selector: 'app-train-word',
	templateUrl: './train-word.component.html',
	styleUrls: ['./train-word.component.css']
})
export class TrainWordComponent implements OnInit {
	serverImagesURL: string = '';		//url for image resources
	trainedNO: number = 0;
	totalTraining: number = 0;
	testModes: Option[];   //list of test mode
	selectedTestMode: number; //selected test mode
	ranges: Option[];      //list of test part (20 words for 1 part)
	selectedRanges: number[];  //selected parts
	showHideButtonName: string = "Show more";  //button's name
	isShowMore: boolean = false;  //flag show kanji explain

	allWordDataInDB: Words[];	//all word's data in Database
	allWordData: Words[];  		//all word's data base on selected dataset
	wordData: Words[];     		//word's data for training
	listIndexWord: number[] = [];  //list available index of words that haven't trained yet
	numberOfRandomWords: number = 0;

	inputWord: string = '';        //user input for training
	previousTrainingWord: Words;    //the previous training word
	nextTrainingWord: Words;        //the next training word, use for preloading
	trainingWord: Words;            //the current training word
	trainingWordIndex: number;     //the index of current training word
	nextTrainingWordIndex: number;  //the next index of current training word.
	inputColor: string = this.config.color.blue;  //color for input text
	isLastWord: boolean = false;   //check the training word is the last word
	isFastReview: boolean = false;				//flag check fast review or not
	showListWordTable: boolean = true;	//show table list words
	mark: number = 0;				//mark of training number not remember, remember, deep remember

	wordEnum = WordEnum;  //use for checking condition in html page
	viewColumns: Option[];  //list of column could be viewed
	selectedViewColumn: number[]; //list of selected column to be view (init with word's column)
	displayedColumns: string[]; //list of displaying column in the screen
	dataSource: Words[];  //data source for rendering table on right hand side
	dataset: Option[];    //option for dropdownlist 'Dataset'
	selectedDataSource: any;  //selected dataset
	currentUserSetting: UserSetting;
	tags: Tags[];
	cards: KeyValue<string, string>[] = [];

	constructor(private common: CommonService, public config: Config, private tagService: TagsService,
		private wordService: WordService, private dataSourceService: DataSourcesService, private setting: UserSettingService, public dialog: MatDialog) {
		this.onResetTrainedNumber = this.onResetTrainedNumber.bind(this);
	}

	ngOnInit() {
		this.serverImagesURL = this.config.apiServiceURL.images;
		let promises = [
			this.getListOfDataset(),
			this.getUserSetting(),
			this.getAllTags()
		];
		Promise.all(promises).then((result) => {
			//get user setting
			let userSetting = this.common.getUserSettingForPage(this.currentUserSetting, this.config.userSettingKey.page.wordTrain);
			this.selectedViewColumn = userSetting.selectedViewColumn
				? userSetting.selectedViewColumn :
				[
					this.config.viewColumnsDef.word
					, this.config.viewColumnsDef.meaning
				];
			let selectedDataSource:any = userSetting.selectedDatasource
				? userSetting.selectedDatasource
				: (this.dataset.length != 0)
					? this.dataset[0].value
					: 0;
			this.selectedTestMode = userSetting.selectedTrainingMode
				? userSetting.selectedTrainingMode : WordEnum.word;
			this.showListWordTable = !!userSetting.showTable;
			this.isFastReview = !!userSetting.fastReview;
			this.mark = userSetting.mark ? userSetting.mark : 0;
			this.getTrainingWordByFilter(selectedDataSource, this.mark, userSetting.selectedPartitions);
			this.testModes = this.getAllTestMode(); //get test mode
			this.viewColumns = this.getAllViewMode(); //get all view column
			this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get displaying column
		});
	}

	/**
	 * Handle when user click on a card
	 * @param value value of card
	 */
	onCardSelected(value: string) {
		this.compareCardSelection(value);
	}

	/**
	 * Handle tag selection changed
	 * @param event event parameter
	 */
	onTagSelectionChangeHandler(event) {
		this.wordService.updateData([this.previousTrainingWord]).toPromise();
	}

	/**
	 * Mark training word
	 * @param event 
	 */
	onMarkTrainingWordHandler(event) {
		this.previousTrainingWord.mark = (this.previousTrainingWord.mark + 1) % 3;
		this.wordService.updateData([this.previousTrainingWord]).toPromise();
		//update to word list
		this.allWordDataInDB = this.allWordDataInDB.map((val)=>{
			if(val._id == this.previousTrainingWord._id){
				val.mark = this.previousTrainingWord.mark;
			}
			return val;
		});
	}

	/**
	 * Handle reset trained number
	 */
	onResetTrainedNumber() {
		this.wordService.setTrainedNumber([]).toPromise();
	}

	/**
	 * Handle click on setting icon
	 */
	onSettingCLick() {
		const dialogRef = this.dialog.open(SettingDialog, {
			width: '80vw',
			data: {
				sources: this.dataset,
				selectedSource: this.selectedDataSource,
				trainingModes: this.testModes,
				selectedTrainingMode: this.selectedTestMode,
				isFastReview: this.isFastReview,
				showTable: this.showListWordTable,
				mark: this.mark,
				onResetTrainedNumber: this.onResetTrainedNumber
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				//update setting config
				this.selectedTestMode = result.selectedTrainingMode;
				this.isFastReview = result.isFastReview;
				this.showListWordTable = result.showTable;
				//store the setting config
				this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordTrain, this.config.userSettingKey.selectedDatasource, result.selectedSource);
				this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordTrain, this.config.userSettingKey.mark, result.mark);
				this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordTrain, this.config.userSettingKey.selectedTrainingMode, this.selectedTestMode);
				this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordTrain, this.config.userSettingKey.fastReview, this.isFastReview);
				this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordTrain, this.config.userSettingKey.showTable, this.showListWordTable);
				this.setting.updateData([this.currentUserSetting]);
				//update page
				if (this.selectedDataSource != result.selectedSource || this.mark != result.mark){
					this.getTrainingWordByFilter(result.selectedSource, result.mark);
				}
				else{
					this.cards = this.buildListCards(numberOfCard, this.trainingWord, this.common.clone(this.allWordDataInDB));
				}
			}
		});
	}

	async getTrainingWordByFilter(dataSource: string, mark: number, selectedPartitions?: any) {
		this.mark = mark;
		if (this.selectedDataSource != dataSource) {
			this.selectedDataSource = dataSource;
			let data = await this.wordService.getWordsByFilter(dataSource,
				'',
				null,
				null,
				0,
				null).toPromise();
			this.allWordDataInDB = this.wordService.convertListData(data.data);
		}
		this.allWordData = this.allWordDataInDB.filter((val) => val.mark == this.mark || this.mark == -1);
		this.ranges = this.getAllRange(selectedPartitions);
	}

	/**
	 * Get user setting
	 */
	private async getUserSetting() {
		this.currentUserSetting = await this.setting.getUserSetting();
	}

	/**
	 * Get all tags
	 */
	private async getAllTags() {
		this.tags = await this.tagService.getAllData();
	}

	/**
	 * Get all dataset
	 */
	async getListOfDataset() {
		let result: Option[] = [];
		result.push({ value: -1, viewValue: this.config.defaultDropDownOptions['-1'] });
		let ds = await this.dataSourceService.getAllData();
		if (ds) {
			for (var i = 0; i < ds.length; i++) {
				result.push({
					value: ds[i]._id,
					viewValue: ds[i].name
				});
			}
		}
		this.dataset = result;
	}

	/**
	 * handle view column selection
	 * @param event event
	 */
	onViewModeChangeHandler(event) {
		this.displayedColumns = this.getColumnDef(this.selectedViewColumn); //get display column
		this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordTrain, this.config.userSettingKey.selectedViewColumn, this.selectedViewColumn);
		this.setting.updateData([this.currentUserSetting]);
	}

	/**
	 * get all column could be view on screen
	 */
	getAllViewMode(): Option[] {
		return [
			{ value: this.config.viewColumnsDef.word, viewValue: this.config.viewColumns.word },
			{ value: this.config.viewColumnsDef.type, viewValue: this.config.viewColumns.type },
			{ value: this.config.viewColumnsDef.pronun, viewValue: this.config.viewColumns.pronun },
			{ value: this.config.viewColumnsDef.kanji, viewValue: this.config.viewColumns.kanji },
			{ value: this.config.viewColumnsDef.chinaMeaning, viewValue: this.config.viewColumns.chinaMeaning },
			{ value: this.config.viewColumnsDef.meaning, viewValue: this.config.viewColumns.meaning },
			{ value: this.config.viewColumnsDef.example, viewValue: this.config.viewColumns.example },
			{ value: this.config.viewColumnsDef.title, viewValue: this.config.viewColumns.title }

		];
	}

	// /**
	//  * get kanji detail by kanji_id
	//  */
	// private updateKanjiExplain() {
	// 	this.allWordDataInDB.forEach(ele => {
	// 		var kanjiExplain = this.common.clone(ele.kanjiExplain);
	// 		if (typeof (kanjiExplain) === 'object') {	//array
	// 			ele.kanjiExplain = '';
	// 			kanjiExplain.forEach(element => {
	// 				ele.kanjiExplain += '\r\n' + this.getKanjiDetailById(element);
	// 			});
	// 		}
	// 	});
	// }

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
	 * event fired when change dropdown list 'position'
	 * @param event event parameter
	 */
	onRangeChangeHandler(event) {
		if (((this.selectedRanges.length != 0 && this.numberOfRandomWords == 0) || this.selectedRanges.length == 1) && this.selectedRanges[0] == 0) {
			//handle case choose 'random'
			this.selectedRanges = [0];
			var value = prompt('How many words do you want to practice?');
			while (isNaN(parseInt(value))) {
				value = prompt('Please provide the number of words do you want to practice!!!');
			}
			this.numberOfRandomWords = parseInt(value);
		}
		else {
			if (this.selectedRanges[0] == 0 && this.selectedRanges.length == 2) {
				this.selectedRanges = [this.selectedRanges[1]];
			}
			this.numberOfRandomWords = 0;
			this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordTrain, this.config.userSettingKey.selectedPartitions, this.selectedRanges);
			this.setting.updateData([this.currentUserSetting]);
		}//get list of training words
		this.reloadPage();
	}

	/**
	 * keyup listener for user input
	 * @param event event
	 */
	onKeyUpInput(event: any) {
		this.inputWord = event.target.value;
		//update color for text (when error => show red color)
		this.inputColor = this.common.checkInputWordExisted(this.inputWord, this.wordData, this.selectedTestMode)
			? this.config.color.blue : this.config.color.red;

		if (event.which == 13) {  //enter keycode or auto next
			this.compareInputNormally();
		}
	}

	/**
	 * move next training word
	 */
	onMoveNextWord() {
		this.dataSource[this.trainingWordIndex].rowColor = this.config.color.bgTrainedRowColor;
		this.trainedNO++;
		this.processNewWord();
	}

	/**
	 * show more information of kanji
	 */
	onShowMore() {
		this.isShowMore = !this.isShowMore;
		this.showHideButtonName = this.isShowMore ? "Hide" : "Show more";
	}

	/**
	 * get all testing mode
	 */
	getAllTestMode(): Option[] {
		return [
			{ value: WordEnum.word, viewValue: this.config.testMode.newWord },
			{ value: WordEnum.meaning, viewValue: this.config.testMode.meaning },
			{ value: WordEnum.image, viewValue: this.config.testMode.image },
			{ value: WordEnum.kanji, viewValue: this.config.testMode.kanji }
		];
	}

	/**
	 * get all parts base on the number of words in data source
	 */
	getAllRange(selectedPartitions?): Option[] {
		let maxPosition = Math.ceil(this.allWordData.length / 20); //get how many parts available in this data source
		//create option for dropdown list
		let positions: Option[] = [];
		positions.push({ value: 0, viewValue: 'Random' });
		for (let i = 1; i <= maxPosition; i++) {
			positions.push({ value: i, viewValue: i.toString() })
		}
		this.selectedRanges = selectedPartitions
			? selectedPartitions
			: [positions.length - 1];
		this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.wordTrain, this.config.userSettingKey.selectedPartitions, this.selectedRanges);
		this.setting.updateData([this.currentUserSetting]);
		this.reloadPage();
		return positions;
	}

	/**
	 * Get all training words base on selected parts
	 * @param parts list of selected parts for training
	 */
	getTrainingWordBySelectedParts(parts) {
		this.wordData = [];
		this.listIndexWord = [];
		if (this.numberOfRandomWords == 0) {
			//each selected part, we will get all 20 words in its range
			parts.forEach(element => {
				this.wordData = this.wordData.concat(this.common.clone(this.allWordData.slice((element - 1) * 20, (element) * 20)));
			});
		}
		else {
			this.wordData = this.getWordDataByRandomNumber(this.numberOfRandomWords);
		}
		this.dataSource = this.common.clone(this.wordData);

		//store all index that will be trained.
		for (let i = 0; i < this.wordData.length; i++) {
			this.listIndexWord.push(i);
			this.wordData[i].trainedNumber += 1;
		}
		this.totalTraining = this.wordData.length;
		this.processNewWord();  //process the first element for testing
	}

	private refreshTrainingWords() {
		this.listIndexWord = [];

		//store all index that will be trained.
		for (let i = 0; i < this.wordData.length; i++) {
			this.listIndexWord.push(i);
			this.wordData[i].rowColor = null;
			this.dataSource[i].rowColor = null;
		}
		this.processNewWord();  //process the first element for testing
	}

	private getWordDataByRandomNumber(number) {
		var result = [];
		var cloneAllWords = this.common.clone(this.allWordData.filter((val) => {
			return val.trainedNumber == 0;
		}));
		for (var i = 0; i < number; i++) {
			var randomIndex = this.common.random(cloneAllWords.length);
			result = result.concat(cloneAllWords.splice(randomIndex, 1));
		}
		return result;
	}
	/**
	 * random the new word for training
	 */
	private randomNewWord(): Words {
		//random an index number of available traing words
		let randomNumber: number = this.common.random(this.listIndexWord.length);
		//get available index in trainging word
		this.trainingWordIndex = this.nextTrainingWordIndex;
		this.nextTrainingWordIndex = this.listIndexWord[randomNumber];
		//get word
		let word: Words = this.wordData[this.nextTrainingWordIndex];
		// if (word.kanjiExplain)
		// 	word.kanjiExplain = word.kanjiExplain.replace(new RegExp('\r\n', 'g'), "<br \\>").replace(new RegExp('\n', 'g'), "<br \\>");
		//remove index from list available training words
		this.listIndexWord.splice(randomNumber, 1);
		return word;
	}

	/**
	 * process to training new word
	 */
	private processNewWord() {
		if (this.selectedRanges.length == 0)
			return;
		//reset all current words
		(<HTMLInputElement>document.getElementById('inputWordId')).value = '';
		this.inputWord = '';
		this.inputColor = this.config.color.blue;
		//random new word
		if (this.isLastWord) {
			this.isLastWord = false;
			if (this.trainingWord) {
				alert("Finish work. Stop typing");
				this.wordService.setTrainedNumber(this.wordData).toPromise();
				this.refreshPage();
			}
			return;
		}

		this.previousTrainingWord = this.common.clone(this.trainingWord);
		this.trainingWord = this.common.clone(this.nextTrainingWord);//generate card list for selection
		this.cards = this.buildListCards(numberOfCard, this.trainingWord, this.common.clone(this.allWordDataInDB));

		if (this.listIndexWord.length != 0) {
			this.nextTrainingWord = this.randomNewWord();
		}
		else {
			this.isLastWord = true;
		}
		if (this.trainingWord == null) {
			this.processNewWord();
		}
	}

	/**
	 * reload the page
	 */
	private reloadPage() {
		this.resetLayout();
		this.getTrainingWordBySelectedParts(this.selectedRanges);
	}

	/**
	 * Refresh the page
	 */
	private refreshPage() {
		this.resetLayout();
		this.refreshTrainingWords();
	}

	/**
	 * reset layout
	 */
	private resetLayout() {
		this.trainedNO = 0;
		this.inputWord = '';
		this.previousTrainingWord = null;
		this.nextTrainingWord = null;
		this.inputColor = this.config.color.blue;
		this.trainingWord = null;
	}

	/**
	 * Get all cards to show on selection mode
	 * @param noCard number of cards need to generate
	 * @param targetCard the card contain the right word for training
	 * @param listAllCards all cards need to be trained
	 */
	private buildListCards(noCard: number, targetCard: Words, listAllCards: Words[]): KeyValue<string, string>[] {
		//if there is no target card => no need to build list choices
		if (!targetCard)
			return;
		let property: string = '';
		switch (this.selectedTestMode) {
			case this.wordEnum.word:
			case this.wordEnum.image:
				property = 'word';
				break;
			case this.wordEnum.kanji:
				property = 'chinaMeaning';
				break;
			case this.wordEnum.meaning:
				property = 'meaning';
				break;
			default:
				property = 'word';
				break;
		}
		let random: any = this.common.random(listAllCards.length);
		//initial the return value with the right word
		let result: KeyValue<string, string>[] = [{
			key: random,
			value: property == 'chinaMeaning' ? targetCard[property].substring(1, targetCard[property].length - 1).toLocaleLowerCase() : targetCard[property].toLocaleLowerCase()
		}];
		//add random word for trainer to select
		for (let i = 1; i < noCard; i++) {
			random = this.common.random(listAllCards.length);
			let card = listAllCards[random];
			//just add new word that different from the target word to card list
			if (targetCard._id != card._id) {
				result.push({
					key: random,
					value: property == 'chinaMeaning' ? card[property].substring(1, card[property].length - 1).toLocaleLowerCase() : card[property].toLocaleLowerCase()
				});
			}
			else {
				i--;
			}
			listAllCards.splice(random, 1);
		}
		return result.sort((a, b) => parseInt(a.key) - parseInt(b.key));
	}

	/**
	 * Compare the selected card with the training word
	 * @param value selected card
	 */
	private compareCardSelection(value: string) {
		let isTheSame: boolean = this.common.compareInputWordWithTraining(value, this.trainingWord, this.selectedTestMode);
		//if input word not map any word available in data base => alert
		if (!isTheSame) {
			alert(`[${value}] is not correct`);
		}
		else {
			this.trainedNO++;
			this.processNewWord();
		}
	}

	/**
	 * handle action to compare inputed value with the training word without automation
	 */
	private compareInputNormally() {
		this.inputWord = this.inputWord.slice(0, -1); //remove last element (/n)
		//find index number of input word
		let isTheSame: boolean = this.common.compareInputWordWithTraining(this.inputWord, this.trainingWord, this.selectedTestMode);
		//if input word not map any words available in data base => alert
		if (!isTheSame) {
			alert(this.inputWord + ' is not exist in database');  //TODO: create modal popup for this message
		}
		else {
			this.dataSource[this.trainingWordIndex].rowColor = this.config.color.bgTrainedRowColor;
			this.trainedNO++;
			this.processNewWord();
		}
	}
}