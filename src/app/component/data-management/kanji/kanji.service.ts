import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CommonApiService } from 'src/app/services/common-api.service';
import { Config } from 'src/app/configuration/config';
import { Kanjis } from 'src/app/class/kanjis';
import { DataSourceResponse } from 'src/app/interface/dataSource.response';

@Injectable({
	providedIn: 'root'
})
export class KanjiService {
	serverURL: string = '';
	constructor(private apiService: CommonApiService, private config: Config) {
		this.serverURL = this.config.apiServiceURL.kanjis;
	}

	/**
	 * Get kanjis by filter
	 * @param courseId dataset id
	 * @param filter filter string
	 * @param sortOrder sort order
	 * @param pageNumber page number
	 * @param pageSize page size
	 */
	getKanjisByFilter(courseId: number, filter = '', sortOrder = 'asc',
		pageNumber = 0, pageSize = 50): Observable<DataSourceResponse<Kanjis[]>> {
		let params = new HttpParams()
			.set('courseId', courseId.toString())
			.set('filter', filter)
			.set('sortOrder', sortOrder)
			.set('pageNumber', pageNumber.toString())
			.set('pageSize', pageSize.toString());
		return this.apiService.getWithParams(`${this.serverURL}/byfilter`, params);
	}

	/**
	 * Get all data
	 */
	async getAllData() {
		let result = await this.apiService.get(this.serverURL).toPromise();
		return this.convertListData(result);
	}

	/**
	 * Get all data
	 */
	async forceGetAllDataBase() {
		let result = await this.apiService.get<number>(`${this.serverURL}/new`).toPromise();
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
	 * update trained number
	 * @param data list of data need to update trained number
	 */
	setTrainedNumber<T>(data: T) {
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
