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
		var result;
		let setting = await this.getAllData();
		let currentUser = this.authService.currentUserValue;
		for(var i = 0; i < setting.length; i++){
			if(setting[i].userId == currentUser._id){
				result = setting[i];
				break;
			}
		}
		return result;
	}

	/**
	 * Get data by id
	 * @param id data's id
	 */
	getDataById(id: number) {
		const url = `${this.serverURL}/${id}`;
		return this.apiService.get(this.serverURL);
	}

	/**
	 * Create new data
	 * @param data data's data
	 */
	createData<T>(data: T) {
		return this.apiService.post(data, this.serverURL);
	}

	/**
	 * Update the existed data
	 * @param data data's data
	 */
	updateData<T>(data: T[]) {
		return this.apiService.update(data, this.serverURL);
	}

	/**
	 * delete data
	 * @param data list of deleted records
	 */
	deleteBulkData<T>(data: T[]) {
		return this.apiService.deleteBulk(data, this.serverURL);
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
