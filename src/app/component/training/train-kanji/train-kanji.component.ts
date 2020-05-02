import { Component, OnInit } from '@angular/core';
import { Config } from 'src/app/configuration/config';
import { Option } from 'src/app/interface/option';
import { WordEnum } from 'src/app/configuration/enums';
import { CommonService } from 'src/app/services/common.service';
import { Kanjis } from 'src/app/class/kanjis';
import { KanjiService } from '../../data-management/kanji/kanji.service';


@Component({
	selector: 'app-train-kanji',
	templateUrl: './train-kanji.component.html',
	styleUrls: ['./train-kanji.component.css']
})
export class TrainKanjiComponent implements OnInit {
	serverImagesURL:string = '';				//url for image resources
	//binding variables
	selectedTestMode: number = WordEnum.word; //get training mode, selected by user
	selectedRanges: number[];                 //get training ranges selected by user
	inputKanji: string = '';                  //current training kanji input by user
	numberOfRandomKanji: number = 0;          //set number of random Kanji input by user
	selectedKanjiLevel: number = 0;            //selected kanji level

	//display varibles
	inputColor: string = this.config.color.blue;  //color for input text
	total: number = 0;     //total training kanji
	trained: number = 0;   //number of trained kanji

	//data variables
	originalData: Kanjis[];          //all initial kanji data
	allKanjiData: Kanjis[];          //all filtered kanji data
	kanjiData: Kanjis[];             //selected kanji data
	previousTrainingKanji: Kanjis;   //the previous training kanji
	trainingKanji: Kanjis;           //the current training kanji
	nextTrainingKanji: Kanjis;       //the next training kanji, use for preloading
	trainingKanjiIndex: number;     //the index of current training kanji
	nextTrainingKanjiIndex: number;  //the next index of current training kanji.

	//setting variables
	listIndexKanji: number[] = [];  //list available index of kanji that haven't trained yet
	testModes: Option[];            //list of test mode
	ranges: Option[];               //all ranges test
	kanjiLevels: Option[];    //option for dropdownlist 'level'

	//flag
	isAutoNext: boolean = false; //auto next kanji flag
	isLastKanji: boolean = false; //flag check last training kanji

	wordEnum = WordEnum;
	constructor(private common: CommonService, private config: Config, private kanjiService: KanjiService) { }

	ngOnInit() {
		this.serverImagesURL = this.config.apiServiceURL.images;
		this.kanjiLevels = this.getListOfKanjiLevel(); //get all dataset
		this.selectedKanjiLevel = this.kanjiLevels[0].value;
		this.testModes = this.getAllTestMode(); //get test mode
		this.getAllKanji().then((value) => {
			this.updateDataBaseOnSelectedKanjiLevel(this.selectedKanjiLevel);
		});
	}

	/**
	 * event fired when change dropdown list 'position'
	 * @param event event parameter
	 */
	onRangeChangeHandler(event) {
		if (this.selectedRanges.length != 0 && this.selectedRanges[0] == 0) {
			//handle case choose 'random'
			this.selectedRanges = [0];
			var value = prompt('How many kanji do you want to practice?');
			while (isNaN(parseInt(value))) {
				value = prompt('Please provide the number of kanji do you want to practice!!!');
			}
			this.numberOfRandomKanji = parseInt(value);
		}
		else {
			this.numberOfRandomKanji = 0;
		}//get list of training kanjis
		this.reloadPage();
	}

	/**
	 * keyup listener for user input
	 * @param event event
	 */
	onKeyUpInput(event: any) {
		this.inputKanji = event.target.value;
		//update color for text (when error => show red color)
		this.inputColor = this.common.checkInputKanjiExisted(this.inputKanji, this.kanjiData, this.selectedTestMode)
			? this.config.color.blue : this.config.color.red;

		if (event.which == 13) {  //enter keycode or auto next
			this.compareInputNormally();
		}
	}

	/**
	 * event move next button
	 */
	onMoveNextKanji() {
		this.trained++;
		this.processNewKanji();
	}

	/**
	 * handle event change dropdown list dataset
	 * @param event event parameter
	 */
	onChangeHandler(event) {
		this.updateDataBaseOnSelectedKanjiLevel(this.selectedKanjiLevel);
	}

	private updateDataBaseOnSelectedKanjiLevel(selected) {
		this.allKanjiData = this.common.clone(this.originalData.filter(function (val, index) {
			return val.JLPTLevel == selected || selected == -1;	//-1 is all
		}));
		this.ranges = this.getAllRange();
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
	 * get kanjis data source
	 * @param datasetId dataset Id
	 */
	private async getAllKanji() {
		let dataConverted = await this.kanjiService.getAllData();
		if (dataConverted) {
			this.originalData = dataConverted;
		}
	}

	/**
	 * get all parts base on the number of kanjis in data source
	 */
	private getAllRange(): Option[] {
		let maxPosition = Math.ceil(this.allKanjiData.length / 20); //get how many parts available in this data source
		//create option for dropdown list
		let positions: Option[] = [];
		positions.push({ value: 0, viewValue: 'Random' });
		for (let i = 1; i <= maxPosition; i++) {
			positions.push({ value: i, viewValue: i.toString() })
		}
		this.selectedRanges = [positions.length - 1];  //initial the last part for training
		this.reloadPage();
		return positions;
	}

	/**
   * get all testing mode
   */
	private getAllTestMode(): Option[] {
		return [
			{ value: WordEnum.word, viewValue: this.config.testMode.meaning },
			{ value: WordEnum.kanji, viewValue: this.config.testMode.kanji }
		];
	}

	/**
   * reload the page
   */
	private reloadPage() {
		this.resetLayout();
		this.getTrainingKanjiBySelectedParts(this.selectedRanges);
	}

	/**
	 * reset layout
	 */
	private resetLayout() {
		this.inputKanji = '';
		this.inputColor = this.config.color.blue;
		this.trainingKanji = null;
		this.previousTrainingKanji = null;
		this.nextTrainingKanji = null;
		this.total = 0;
		this.trained = 0;
	}

	/**
	 * Get all training kanjis base on selected parts
	 * @param parts list of selected parts for training
	 */
	private getTrainingKanjiBySelectedParts(parts) {
		this.kanjiData = [];
		this.listIndexKanji = [];
		if (this.numberOfRandomKanji == 0) {
			//each selected part, we will get all 20 kanjis in its range
			parts.forEach(element => {
				this.kanjiData = this.kanjiData.concat(this.common.clone(this.allKanjiData.slice((element - 1) * 20, (element) * 20)));
			});
		}
		else {
			this.kanjiData = this.getKanjiDataByRandomNumber(this.numberOfRandomKanji);
		}

		//store all index that will be trained.
		for (let i = 0; i < this.kanjiData.length; i++) {
			this.listIndexKanji.push(i);
		}
		this.trained = 0;
		this.total = this.kanjiData.length;
		this.processNewKanji();  //process the first element for testing
	}

	private getKanjiDataByRandomNumber(number) {
		var result = [];
		var cloneAllKanji = this.common.clone(this.allKanjiData);
		for (var i = 0; i < number; i++) {
			var randomIndex = this.common.random(cloneAllKanji.length);
			result = result.concat(cloneAllKanji.splice(randomIndex, 1));
		}
		return result;
	}

	/**
	 * process to training new kanji
	 */
	private processNewKanji() {
		if (this.selectedRanges.length == 0)
			return;
		//reset all current kanjis
		(<HTMLInputElement>document.getElementById('inputKanjiId')).value = '';
		this.inputKanji = '';
		this.inputColor = this.config.color.blue;
		//random new kanji
		if (this.isLastKanji) {
			this.isLastKanji = false;
			alert("Finish work. Stop typing");
			this.refreshPage();
			return;
		}
		this.previousTrainingKanji = this.common.clone(this.trainingKanji);
		this.trainingKanji = this.common.clone(this.nextTrainingKanji);
		if (this.listIndexKanji.length != 0) {
			this.nextTrainingKanji = this.randomNewKanji();
		}
		else {
			this.isLastKanji = true;
		}
		if (this.trainingKanji == null) {
			this.processNewKanji();
		}
	}

	/**
   * Refresh the page
   */
	private refreshPage() {
		this.resetLayout();
		this.refreshTrainingKanji();
	}

	/**
	 * random the new kanji for training
	 */
	private randomNewKanji(): Kanjis {
		//random an index number of available traing kanjis
		let randomNumber: number = this.common.random(this.listIndexKanji.length);
		//get available index in trainging kanji
		this.trainingKanjiIndex = this.nextTrainingKanjiIndex;
		this.nextTrainingKanjiIndex = this.listIndexKanji[randomNumber];

		//get kanji
		let kanji: Kanjis = this.kanjiData[this.nextTrainingKanjiIndex];
		if (kanji.explain)
			kanji.explain = kanji.explain.replace(new RegExp('\r\n', 'g'), "<br \\>").replace(new RegExp('\n', 'g'), "<br \\>");
		//remove index from list available training kanjis
		this.listIndexKanji.splice(randomNumber, 1);
		return kanji;
	}

	private refreshTrainingKanji() {
		this.listIndexKanji = [];
		this.total = this.kanjiData.length;
		//store all index that will be trained.
		for (let i = 0; i < this.kanjiData.length; i++) {
			this.listIndexKanji.push(i);
			this.kanjiData[i].rowColor = null;
		}
		this.processNewKanji();  //process the first element for testing
	}

	/**
	 * handle action to compare inputed value with the training kanji without automation
	 */
	private compareInputNormally() {
		this.inputKanji = this.inputKanji.slice(0, -1); //remove last element (/n)
		//find index number of input kanji
		let isTheSame: boolean = this.common.compareInputKanjiWithTraining(this.inputKanji, this.trainingKanji, this.selectedTestMode);
		//if input kanji not map any kanji available in data base => alert
		if (!isTheSame) {
			alert(this.inputKanji + ' is not exist in database');  //TODO: create modal popup for this message
		}
		else {
			this.trained++;
			this.processNewKanji();
		}
	}
}
