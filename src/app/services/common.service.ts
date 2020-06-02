import { Injectable } from "@angular/core";
import { Word } from 'src/app/interface/word';
import { WordEnum } from 'src/app/configuration/enums';
import { Kanji } from '../interface/kanji';
import { Words } from '../class/words';
import { Kanjis } from '../class/kanjis';
import { UserSetting } from '../class/userSetting';
import { PageConfiguration } from '../class/common/pageConfiguration';
import { Config } from '../configuration/config';

@Injectable()
export class CommonService {
    constructor(private config: Config) { }

    /**
     * get a random number in given range
     * @param range range of random number
     */
    random(range) {
        return Math.floor(Math.random() * range);
    }

    /**
     * compare two word
     * @param word1 word 1
     * @param word2 word 2
     */
    compareTwoWord(word1: Word, word2: Word): boolean {
        if (word1.meaning == word2.meaning
            && word1.example == word2.example
            && word1.pronun == word2.pronun
            && word1.title == word2.title
            && word1.type == word2.type
            && word1.word == word2.word)
            return true;
        return false;
    }

    /**
     * get the index of selected word in list.
     * @param word the selected word
     * @param wordList the list of words
     */
    getIndexWordExisted(word: Word, wordList: Word[]): number {
        let index: number = -1;
        //traverse all element and compare
        for (let i = 0; i < wordList.length; i++) {
            if (this.compareTwoWord(word, wordList[i])) {
                index = i;
                break;
            }
        }
        return index;
    }

    /**
     * check if the input is existed in list words
     * @param inputValue input user entered
     * @param wordList list of training words
     * @param type type of training
     */
    checkInputWordExisted(inputValue: string, wordList: Words[], type: WordEnum): boolean {
        let result: boolean = false;
        let property: string = '';
        switch (type) {
            case WordEnum.word:
            case WordEnum.image:
                property = 'word';
                break;
            case WordEnum.meaning:
                property = 'meaning';
                break;
            case WordEnum.kanji:
                property = 'chinaMeaning';
                break;
            default:
                property = 'word';
                break;
        }
        //traverse all words and check if the input value is existed
        for (let i = 0; i < wordList.length; i++) {
            if (wordList[i].hasOwnProperty(property) && wordList[i][property].toLocaleLowerCase().includes(inputValue)) {
                result = true;
                break;
            }
        }
        return result;
    }

    /**
     * check if the input is existed in list kanji
     * @param inputValue input user entered
     * @param kanjiList list of training kanji
     * @param type type of training
     */
    checkInputKanjiExisted(inputValue: string, kanjiList: Kanjis[], type: WordEnum): boolean {
        let result: boolean = false;
        let property: string = '';
        switch (type) {
            case WordEnum.word:
                property = 'word';
                break;
            default:
                property = 'meaning';
                break;
        }
        //traverse all words and check if the input value is existed
        for (let i = 0; i < kanjiList.length; i++) {
            if (kanjiList[i].hasOwnProperty(property) && kanjiList[i][property].toLocaleLowerCase().includes(inputValue)) {
                result = true;
                break;
            }
        }
        return result;
    }

    /**
     * get the index of input in list kanji
     * @param inputValue input user entered
     * @param trainingKanji the selected training kanji
     * @param type type of training
     */
    compareInputKanjiWithTraining(inputValue: string, trainingKanji: Kanjis, type: WordEnum): boolean {
        let result: boolean = false;
        let property: string = '';
        switch (type) {
            case WordEnum.word:
                property = 'word';
                break;
            default:
                property = 'meaning';
                break;
        }

        if (trainingKanji.hasOwnProperty(property)) {
            if (trainingKanji[property].toLocaleLowerCase() == inputValue ||
                (property == 'chinaMeaning' && trainingKanji[property].substring(1, trainingKanji[property].length - 1).toLocaleLowerCase() == inputValue)) {
                result = true;
            }
        }
        return result;
    }

    /**
     * get the index of input in list words
     * @param inputValue input user entered
     * @param trainingWord the selected training word
     * @param type type of training
     */
    compareInputWordWithTraining(inputValue: string, trainingWord: Words, type: WordEnum): boolean {
        let result: boolean = false;
        let property: string = '';
        switch (type) {
            case WordEnum.word:
            case WordEnum.image:
                property = 'word';
                break;
            case WordEnum.kanji:
                property = 'chinaMeaning';
                break;
            case WordEnum.meaning:
                property = 'meaning';
                break;
            default:
                property = 'word';
                break;
        }

        if (trainingWord.hasOwnProperty(property)) {
            if (trainingWord[property].toLocaleLowerCase() == inputValue ||
                (property == 'chinaMeaning' && trainingWord[property].substring(1, trainingWord[property].length - 1).toLocaleLowerCase() == inputValue)) {
                result = true;
            }
        }
        return result;
    }

    /**
     * deep clone an object
     * @param obj clone object
     */
    clone(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * convert date type to string base on format
     * @param date date
     * @param format format ex: yyyyMMdd or yyyyMMdd HHmmmSS ..etc
     */
    convertDateToStringByFormat(date: Date, format: string): string {
        let result: string = '';
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        result = format.replace('yyyy', year.toString())
            .replace('MM', this.fixedFormatTwoDigit(month))
            .replace('dd', this.fixedFormatTwoDigit(day))
            .replace('HH', this.fixedFormatTwoDigit(hour))
            .replace('mmm', this.fixedFormatTwoDigit(minute))
            .replace('SS', this.fixedFormatTwoDigit(second));
        return result;
    }

    /**
     * return the number with two fixed digits
     * @param number source number
     */
    fixedFormatTwoDigit(number: number): string {
        let result: string = '';
        result = number < 10 ? ('0' + number.toString()) : number.toString();
        return result;
    }

    setCookie(name: string, value: string, days: any): void {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    getCookie(name: string): string {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    eraseCookie(name: string): void {
        document.cookie = name + '=; Max-Age=-99999999;';
    }

    isKanji(ch): boolean {
        return (ch >= "\u4e00" && ch <= "\u9faf") ||
            (ch >= "\u3400" && ch <= "\u4dbf");
    }

    /**
     * Get kanjis's ID
     * @param kanji the input kanji
     * @param allKanjis all kanji
     */
    getKanjiIds(kanji, allKanjis) {
        let kanjiList = [];
        let result = [];
        if (kanji == null)
            return result;
        for (var i = 0; i < kanji.length; i++) {
            if (this.isKanji(kanji[i])) {
                kanjiList = kanjiList.concat(allKanjis.filter(element => {
                    return element.kanji === kanji[i];
                }));
            }
        }
        for (var i = 0; i < kanjiList.length; i++) {
            result.push(kanjiList[i]._id);
        }
        return result;
    }

    /**
     * Get kanjis explain
     * @param kanji the input kanji
     * @param allKanjis all kanji
     */
    getKanjiExplain(kanji, allKanjis: Kanjis[]) {
        let kanjiList: Kanjis[] = [];
        let result = [];
        if (kanji == null)
            return '';
        for (var i = 0; i < kanji.length; i++) {
            if (this.isKanji(kanji[i])) {
                kanjiList = kanjiList.concat(allKanjis.filter(element => {
                    return element.kanji === kanji[i];
                }));
            }
        }
        for (var i = 0; i < kanjiList.length; i++) {
            result.push(kanjiList[i].explain);
        }
        return result.join('\r\n\r\n');
    }

    updateUserSetting(setting: UserSetting, page, settingKey, settingValue) {
        if (!setting)
            setting = new UserSetting();
        if (!setting.userSetting)
            setting.userSetting = {};
        if (!setting.userSetting[page])
            setting.userSetting[page] = {};
        setting.userSetting[page][settingKey] = settingValue;
        return setting;
    }

    /**
     * get user setting for selected page
     * @param setting user setting
     * @param page the page
     */
    getUserSettingForPage(setting: UserSetting, page: string): PageConfiguration {
        let result = new PageConfiguration();
        if (setting.userSetting && setting.userSetting[page]){
            result.selectedViewColumn = setting.userSetting[page][this.config.userSettingKey.selectedViewColumn];
            result.selectedDatasource = setting.userSetting[page][this.config.userSettingKey.selectedDatasource];
            result.searchWord = setting.userSetting[page][this.config.userSettingKey.searchWord];
            result.selectedPartitions = setting.userSetting[page][this.config.userSettingKey.selectedPartitions];
            result.selectedTrainingMode = setting.userSetting[page][this.config.userSettingKey.selectedTrainingMode];
            result.selectedTags = setting.userSetting[page][this.config.userSettingKey.selectedTags];
        }
        return result;
    }

    /**
     * check the action is disable or not
     * @param action action: create, edit, update, delete
     * @param selected list of selected record
     */
    getActionOptionDisabled(action, selected): boolean{
        let result = true;
		switch(action.value){
			case this.config.optionValue.createNew:
				result = false;
				break;
			case this.config.optionValue.edit:
				if(selected && selected.length == 1){
					result = false;
				}
				break;
			case this.config.optionValue.update:
			case this.config.optionValue.delete:
				if(selected && selected.length != 0){
					result = false;
				}
				break;
			default:
				break;
		}
		return result;
    }
}