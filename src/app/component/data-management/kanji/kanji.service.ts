import { Injectable } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { Config } from 'src/app/configuration/config';
import { Kanjis } from 'src/app/class/kanjis';

@Injectable({
	providedIn: 'root'
})
export class KanjiService {
	serverURL: string = '';
	constructor(private apiService: CommonApiService, private config: Config) {
		this.serverURL = this.config.apiServiceURL.kanjis;
	}

	/**
	 * Get all data
	 */
	async getAllData() {
		let result = await this.apiService.get(this.serverURL).toPromise();
		return this.convertListData(result);
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
	 * update trained number
	 * @param data list of data need to update trained number
	 */
	setTrainedNumber<T>(data: T){
		const url = `${this.serverURL}/${this.config.apiServiceURL.setTrainedNumber}`;
		return this.apiService.post(data, url);
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
	private convertToData(obj: any): Kanjis {
		let data = new Kanjis();
		for (var prop in obj) {
			data[prop] = obj[prop];
		}
		return data;
	}

	/**
	 * Convert list source obj to data
	 * @param obj list source obj
	 */
	private convertListData(obj): Kanjis[] {
		if (obj == null)
			return obj;
		let data = [];
		for (var i = 0; i < obj.length; i++) {
			data.push(this.convertToData(obj[i]));
		}
		return data;
	}
}
