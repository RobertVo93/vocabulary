import { Component, OnInit } from '@angular/core';
import { Config } from 'src/app/configuration/config';
import { Option } from 'src/app/interface/option';
import { WordEnum } from 'src/app/configuration/enums';
import { CommonService } from 'src/app/services/common.service';
import { Grammars } from 'src/app/class/grammars';
import { GrammarService } from '../../data-management/grammar/grammar.service';
import { TagsService } from '../../data-management/tag/tags.service';
import { Tags } from 'src/app/class/tags';
import { UserSetting } from 'src/app/class/userSetting';
import { UserSettingService } from 'src/app/services/user-setting.service';


@Component({
	selector: 'app-train-grammar',
	templateUrl: './train-grammar.component.html',
	styleUrls: ['./train-grammar.component.css']
})
export class TrainGrammarComponent implements OnInit {
	//binding variables
	selectedRanges: number[];                 //get training ranges selected by user
	selectedTags: number[];
	numberOfRandomGrammar: number = 0;          //set number of random Grammar input by user

	//display varibles
	total: number = 0;     //total training Grammar
	trained: number = 0;   //number of trained Grammar

	//data variables
	filteredTags: Option[];				//list of filtered tags options
	tags: Option[];						//list of tags options
	originalGrammarData: Grammars[];	
	allGrammarData: Grammars[];          //all filtered Grammar data
	grammarData: Grammars[];             //selected Grammar data
	trainingGrammar: Grammars;           //the current training Grammar
	trainingGrammarIndex: number;     //the index of current training Grammar

	//setting variables
	listIndexGrammar: number[] = [];  //list available index of Grammar that haven't trained yet
	ranges: Option[];               //all ranges test
	currentUserSetting: UserSetting;

	constructor(private common: CommonService, private config: Config, private setting: UserSettingService, 
		private GrammarService: GrammarService, private tagService: TagsService) { }

	ngOnInit() {
		let promises = [
			this.getAllGrammar(),
			this.setupAllTagOptions(),
			this.getUserSetting()
		];

		Promise.all(promises).then(() => {
			//get user setting
			let userSetting = this.common.getUserSettingForPage(this.currentUserSetting, this.config.userSettingKey.page.grammarTrain);
			this.selectedTags = userSetting.selectedTags
				? userSetting.selectedTags
				: this.selectedTags = [this.filteredTags[0].value];;

			this.updateGrammarOnSelectedTags(this.selectedTags, userSetting.selectedPartitions);
		});
	}

	/**
	 * event fired when change dropdown list 'position'
	 * @param event event parameter
	 */
	onRangeChangeHandler(event) {
		if (((this.selectedRanges.length != 0 && this.numberOfRandomGrammar == 0) || this.selectedRanges.length == 1) && this.selectedRanges[0] == 0) {
			//handle case choose 'random'
			this.selectedRanges = [0];
			var value = prompt('How many grammar do you want to practice?');
			while (isNaN(parseInt(value))) {
				value = prompt('Please provide the number of grammar do you want to practice!!!');
			}
			this.numberOfRandomGrammar = parseInt(value);
		}
		else {
			if (this.selectedRanges[0] == 0 && this.selectedRanges.length == 2) {
				this.selectedRanges = [this.selectedRanges[1]];
			}
			this.numberOfRandomGrammar = 0;
			this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.grammarTrain, this.config.userSettingKey.selectedPartitions, this.selectedRanges);
			this.setting.updateData([this.currentUserSetting]).toPromise();
		}//get list of training Grammars
		this.reloadPage();
	}

	/**
	 * event fired when change dropdown list 'position'
	 * @param event event parameter
	 */
	onTagChangeHandler(event) {
		this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.grammarTrain, this.config.userSettingKey.selectedTags, this.selectedTags);
		this.setting.updateData([this.currentUserSetting]).subscribe(()=> {
			this.updateGrammarOnSelectedTags(this.selectedTags);
		});
		
	}

	/**
	 * event move next button
	 */
	onMoveNextGrammar() {
		this.trained++;
		this.processNewGrammar();
	}

	/**
	 * Handle reset trained number
	 */
	onResetTrainedNumber(){
		this.GrammarService.setTrainedNumber([]).toPromise();
	}

	/**
	 * Trigger update data
	 * @param selectedDataset target dataset Id
	 */
	private updateGrammarOnSelectedTags(selectedTags, selectedPartitions?): any {
		this.allGrammarData = this.getTrainingGrammarBySelectedTags(selectedTags);
		this.ranges = this.getAllRange(selectedPartitions);
	}
	
	/**
	 * get Grammars data source
	 * @param datasetId dataset Id
	 */
	private async getAllGrammar() {
		let dataConverted = await this.GrammarService.getAllData();
		if (dataConverted) {
			this.allGrammarData = dataConverted;
			this.originalGrammarData = dataConverted;
		}
	}

	/**
	 * Get user setting
	 */
	private async getUserSetting() {
		this.currentUserSetting = await this.setting.getUserSetting();
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
	 * get all parts base on the number of Grammars in data source
	 */
	private getAllRange(selectedPartitions?): Option[] {
		let maxPosition = Math.ceil(this.allGrammarData.length / 20); //get how many parts available in this data source
		//create option for dropdown list
		let positions: Option[] = [];
		positions.push({ value: 0, viewValue: 'Random' });
		for (let i = 1; i <= maxPosition; i++) {
			positions.push({ value: i, viewValue: i.toString() })
		}
		this.selectedRanges = selectedPartitions
				? selectedPartitions
				: [positions.length - 1];
		this.currentUserSetting = this.common.updateUserSetting(this.currentUserSetting, this.config.userSettingKey.page.grammarTrain, this.config.userSettingKey.selectedPartitions, this.selectedRanges);
		this.setting.updateData([this.currentUserSetting]).toPromise();
		this.reloadPage();
		return positions;
	}

	/**
   * reload the page
   */
	private reloadPage() {
		this.resetLayout();
		this.getTrainingGrammarBySelectedParts(this.selectedRanges);
	}

	/**
	 * reset layout
	 */
	private resetLayout() {
		this.trainingGrammar = null;
		this.total = 0;
		this.trained = 0;
	}

	/**
	 * Get all training Grammars base on selected parts
	 * @param parts list of selected parts for training
	 */
	private getTrainingGrammarBySelectedTags(tags) {
		let allGrammarData = [];
		tags.forEach(element => {
			allGrammarData = allGrammarData.concat(this.common.clone(this.originalGrammarData.filter(ele => {
				return ele.tags.indexOf(element) != -1;
			})));
		});
		return allGrammarData;
	}

	/**
	 * Get all training Grammars base on selected parts
	 * @param parts list of selected parts for training
	 */
	private getTrainingGrammarBySelectedParts(parts) {
		this.grammarData = [];
		this.listIndexGrammar = [];
		if (this.numberOfRandomGrammar == 0) {
			//each selected part, we will get all 20 Grammars in its range
			parts.forEach(element => {
				this.grammarData = this.grammarData.concat(this.common.clone(this.allGrammarData.slice((element - 1) * 20, (element) * 20)));
			});
		}
		else {
			this.grammarData = this.getGrammarDataByRandomNumber(this.numberOfRandomGrammar);
		}

		//store all index that will be trained.
		for (let i = 0; i < this.grammarData.length; i++) {
			this.listIndexGrammar.push(i);
			this.grammarData[i].trainedNumber += 1;
		}
		this.trained = 0;
		this.total = this.grammarData.length;
		this.processNewGrammar();  //process the first element for testing
	}

	private getGrammarDataByRandomNumber(number) {
		var result = [];
		var cloneAllGrammar = this.common.clone(this.allGrammarData.filter((val) => {
			return val.trainedNumber == 0;
		}));
		for (var i = 0; i < number; i++) {
			var randomIndex = this.common.random(cloneAllGrammar.length);
			result = result.concat(cloneAllGrammar.splice(randomIndex, 1));
		}
		return result;
	}

	/**
	 * process to training new Grammar
	 */
	private processNewGrammar() {
		if (this.selectedRanges.length == 0 || this.allGrammarData.length == 0)
			return;
		//random new Grammar
		if (this.listIndexGrammar.length == 0 && this.trainingGrammar) {
			alert("Finish work. Stop typing");
			this.GrammarService.setTrainedNumber(this.grammarData).toPromise();
			this.refreshPage();
			return;
		}
		this.trainingGrammar = this.randomNewGrammar();
	}

	/**
   * Refresh the page
   */
	private refreshPage() {
		this.resetLayout();
		this.refreshTrainingGrammar();
	}

	/**
	 * random the new Grammar for training
	 */
	private randomNewGrammar(): Grammars {
		//random an index number of available traing Grammars
		let randomNumber: number = this.common.random(this.listIndexGrammar.length);
		//get available index in trainging Grammar
		this.trainingGrammarIndex = this.listIndexGrammar[randomNumber];

		//get Grammar
		let grammar: Grammars = this.grammarData[this.trainingGrammarIndex];
		if (grammar.syntax)
			grammar.syntax = grammar.syntax.replace(new RegExp('\r\n', 'g'), "<br \\>").replace(new RegExp('\n', 'g'), "<br \\>");
		if (grammar.explain)
			grammar.explain = grammar.explain.replace(new RegExp('\r\n', 'g'), "<br \\>").replace(new RegExp('\n', 'g'), "<br \\>");
		//remove index from list available training Grammars
		this.listIndexGrammar.splice(randomNumber, 1);
		return grammar;
	}

	private refreshTrainingGrammar() {
		this.listIndexGrammar = [];
		this.total = this.grammarData.length;
		//store all index that will be trained.
		for (let i = 0; i < this.grammarData.length; i++) {
			this.listIndexGrammar.push(i);
		}
		this.processNewGrammar();  //process the first element for testing
	}
}
