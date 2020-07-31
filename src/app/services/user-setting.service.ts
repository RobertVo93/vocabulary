import { Injectable } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { Config } from 'src/app/configuration/config';
import { UserSetting } from 'src/app/class/userSetting';
import { AuthService } from './authentication/auth.service';

@Injectable({
	providedIn: 'root'
})
export class UserSettingService {
	serverURL: string = '';
	constructor(private apiService: CommonApiService, private config: Config, private authService: AuthService) {
		this.serverURL = this.config.apiServiceURL.userSettings;
	}

	/**
	 * Get all data
	 */
	async getAllData() {
		let result = await this.apiService.get(this.serverURL).toPromise();
		return this.convertListData(result);
	}

	/**
	 * Get user setting
	 */
	async getUserSetting() {
		let currentUser = this.authService.currentUserValue;
		var result = JSON.parse(localStorage.getItem(`${this.config.storageKey.userSetting}_${currentUser._id}`));
		if(result == null){
			let setting = await this.getAllData();
			for(var i = 0; i < setting.length; i++){
				if(setting[i].userId == currentUser._id){
					result = setting[i];
					localStorage.setItem(`${this.config.storageKey.userSetting}_${currentUser._id}`, JSON.stringify(result));
					break;
				}
			}
		}
		return result;
	}

	/**
	 * Update the existed data
	 * @param data data's data
	 */
	updateData(data: any[]) {
		if(data.length == 1){
			let currentUser = this.authService.currentUserValue;
			localStorage.setItem(`${this.config.storageKey.userSetting}_${currentUser._id}`, JSON.stringify(data[0]));
		}
	}

	/**
	 * Convert source obj to data
	 * @param obj source obj
	 */
	private convertToData(obj: any): UserSetting {
		let data = new UserSetting();
		for (var prop in obj) {
			data[prop] = obj[prop];
		}
		return data;
	}

	/**
	 * Convert list source obj to data
	 * @param obj list source obj
	 */
	private convertListData(obj): UserSetting[] {
		if (obj == null)
			return obj;
		let data = [];
		for (var i = 0; i < obj.length; i++) {
			data.push(this.convertToData(obj[i]));
		}
		return data;
	}
}
