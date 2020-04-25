import { Component, OnInit } from '@angular/core';
import { Option } from 'src/app/interface/option';
import { Word } from 'src/app/interface/word';
import { PubSubService } from 'src/app/services/data.service';
import { CommonService } from 'src/app/services/common.service';
import { WordEnum } from 'src/app/configuration/enums';
import { Config } from 'src/app/configuration/config';

@Component({
  selector: 'app-left',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class LeftComponent implements OnInit {
  testModes: Option[];   //list of test mode
  selectedTestMode: number = WordEnum.word; //selected test mode
  ranges: Option[];      //list of test part (20 words for 1 part)
  selectedRanges: number[];  //selected parts
  isAutoNext: boolean = false; //auto next word flag
  showHideButtonName: string = "Show more";  //button's name
  isShowMore: boolean = false;  //flag show kanji explain

  allWordData: Word[];  //word's data source (all)
  wordData: Word[];     //word's data for training
  listIndexWord: number[] = [];  //list available index of words that haven't trained yet
  numberOfRandomWords: number = 0;

  inputWord: string = '';        //user input for training
  previousTrainingWord: Word;    //the previous training word
  nextTrainingWord: Word;        //the next training word, use for preloading
  trainingWord: Word;            //the current training word
  trainingWordIndex: number;     //the index of current training word
  nextTrainingWordIndex: number;  //the next index of current training word.
  inputColor: string = this.config.color.blue;  //color for input text
  isLastWord: boolean = false;   //check the training word is the last word

  wordEnum = WordEnum;  //use for checking condition in html page
  constructor(private data: PubSubService, private common: CommonService, private config: Config) { }

  ngOnInit() {
    this.testModes = this.getAllTestMode(); //get test mode
    //create an listener when selected dataset changed
    this.data.getData(this.config.pubSubKey.datasetId).subscribe(datasetId => {
      this.allWordData = this.getWordDataWithDatasetId(datasetId); //get new data source base on datasetId
      this.ranges = this.getAllRange();   //update list of test part base on the number of words in datasource
    });
  }

  /**
   * event fired when change dropdown list 'choose mode'
   * @param event event parameter
   */
  onTestModeChangeHandler(event) {
    //TODO: Change testing mode
  }

  /**
   * event fired when change dropdown list 'position'
   * @param event event parameter
   */
  onRangeChangeHandler(event) {
    if (this.selectedRanges.length != 0 && this.selectedRanges[0] == 0) {
      //handle case choose 'random'
      this.selectedRanges = [0];
      var value = prompt('How many words do you want to practice?');
      while (isNaN(parseInt(value))) {
        value = prompt('Please provide the number of words do you want to practice!!!');
      }
      this.numberOfRandomWords = parseInt(value);
    }
    else {
      this.numberOfRandomWords = 0;
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
    else if (this.isAutoNext && this.inputWord != '') {
      this.compareInputAutomatically();
    }
  }

  /**
   * move next training word
   */
  onMoveNextWord() {
    this.data.sendData(this.config.pubSubKey.currentTrainingWordIndex, this.trainingWordIndex);  //pubsub the current training word index to right body
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
  getAllRange(): Option[] {
    let maxPosition = Math.ceil(this.allWordData.length / 20); //get how many parts available in this data source
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
   * get words data source
   * @param datasetId dataset Id
   */
  getWordDataWithDatasetId(datasetId: number): Word[] {
    let words: Word[];
    let fileName: string = '';
    switch (datasetId) {
      case 1:
        fileName = this.config.dataSetFileName.duolingo;
        break;
      case 2:
        fileName = this.config.dataSetFileName.mimikara;
        break;
      case 3:
        fileName = this.config.dataSetFileName.minanoNihongo;
        break;
      case 4:
        fileName = this.config.dataSetFileName.collection;
        break;
      default:
        break;
    }
    let sourceFile = require('src/dataset/' + fileName); //read file source
    words = sourceFile.wordData;
    return words;
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

    //send training datasource to right body for displaying
    this.data.sendData(this.config.pubSubKey.dataTraining, this.wordData);

    //store all index that will be trained.
    for (let i = 0; i < this.wordData.length; i++) {
      this.listIndexWord.push(i);
    }
    this.processNewWord();  //process the first element for testing
  }

  private refreshTrainingWords() {
    this.listIndexWord = [];
    //send training datasource to right body for displaying
    this.data.sendData(this.config.pubSubKey.dataTraining, this.wordData);

    //store all index that will be trained.
    for (let i = 0; i < this.wordData.length; i++) {
      this.listIndexWord.push(i);
      this.wordData[i].rowColor = null;
    }
    this.processNewWord();  //process the first element for testing
  }

  private getWordDataByRandomNumber(number) {
    var result = [];
    var cloneAllWords = this.common.clone(this.allWordData);
    for (var i = 0; i < number; i++) {
      var randomIndex = this.common.random(cloneAllWords.length);
      result = result.concat(cloneAllWords.splice(randomIndex, 1));
    }
    return result;
  }
  /**
   * random the new word for training
   */
  private randomNewWord(): Word {
    //random an index number of available traing words
    let randomNumber: number = this.common.random(this.listIndexWord.length);
    //get available index in trainging word
    this.trainingWordIndex = this.nextTrainingWordIndex;
    this.nextTrainingWordIndex = this.listIndexWord[randomNumber];
    //get word
    let word: Word = this.wordData[this.nextTrainingWordIndex];
    if (word.kanjiExplain)
      word.kanjiExplain = word.kanjiExplain.replace(new RegExp('\r\n', 'g'), "<br \\>").replace(new RegExp('\n', 'g'), "<br \\>");
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
      alert("Finish work. Stop typing");
      this.refreshPage();
      return;
    }

    this.previousTrainingWord = this.common.clone(this.trainingWord);
    this.trainingWord = this.common.clone(this.nextTrainingWord);
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
    this.inputWord = '';
    this.previousTrainingWord = null;
    this.nextTrainingWord = null;
    this.inputColor = this.config.color.blue;
    this.trainingWord = null;
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
      this.data.sendData(this.config.pubSubKey.currentTrainingWordIndex, this.trainingWordIndex);  //pubsub the current training word index to right body
      this.processNewWord();
    }
  }

  /**
   * handle action to compare inputed value with the training word automatically
   */
  private compareInputAutomatically() {
    //find index number of input word
    let isTheSame: boolean = this.common.compareInputWordWithTraining(this.inputWord, this.trainingWord, this.selectedTestMode);
    //compare the input word with the training word
    if (isTheSame) {
      this.data.sendData(this.config.pubSubKey.currentTrainingWordIndex, this.trainingWordIndex);  //pubsub the current training word index to right body
      this.processNewWord();
    }
  }
}
