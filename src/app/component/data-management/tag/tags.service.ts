import { Injectable } from '@angular/core';
import { CommonApiService } from 'src/app/services/common-api.service';
import { Config } from 'src/app/configuration/config';
import { Tags } from 'src/app/class/tags';

@Injectable({
	providedIn: 'root'
})
export class TagsService {
	serverURL: string = '';
	constructor(private apiService: CommonApiService, private config: Config) {
		this.serverURL = this.config.apiServiceURL.tags;
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
		return this.apiService.get(url);
	}

	/**
	 * Create new tag
	 * @param tag tag's data
	 */
	createTag(tag: Tags){
		return this.apiService.post(tag, this.serverURL);
	}

	/**
	 * Update the existed tag
	 * @param tag tag's data
	 */
	updateTag(tag: Tags[]){
		return this.apiService.update(tag, this.serverURL);
	}

	/**
	 * delete tag
	 * @param tags list of deleted records
	 */
	deleteBulkTag<T>(tags: T[]){
		return this.apiService.deleteBulk(tags, this.serverURL);
	}
	

	/**
	 * Convert source obj to Tags
	 * @param obj source obj
	 */
	private convertToData(obj: any): Tags {
		let tag = new Tags();
		for (var prop in obj) {
			tag[prop] = obj[prop];
		}
		return tag;
	}

	/**
	 * Convert list source obj to Tags
	 * @param obj list source obj
	 */
	private convertListData(obj): Tags[] {
		let tags = [];
		for (var i = 0; i < obj.length; i++) {
			tags.push(this.convertToData(obj[i]));
		}
		return tags;
	}

}
