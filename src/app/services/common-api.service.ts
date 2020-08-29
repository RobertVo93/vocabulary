import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class CommonApiService {
	private httpOptions = {
		headers: new HttpHeaders({ 'Content-Type': 'application/json' })
	}
	constructor(private http: HttpClient) {

	}

	/**
	 * get the record base on provide url
	 * @param url url
	 */
	getWithParams<T>(url: string, params: HttpParams): Observable<T> {
		return this.http.get<T>(url, { params: params });
	}

	/**
	 * get the record base on provide url
	 * @param url url
	 */
	get<T>(url: string): Observable<T> {
		return this.http.get<T>(url);
	}

	/**
	 * post new data to the provide url
	 * @param data the record need to post
	 * @param url url
	 */
	post<T>(data: T, url: string): Observable<T> {
		return this.http.post<T>(url, data, this.httpOptions);
	}

	/**
	 * post new data to the provide url without http options
	 * @param data the record need to post
	 * @param url url
	 */
	postWithoutOptions<T>(data: T, url: string): Observable<T> {
		return this.http.post<T>(url, data);
	}

	/**
	 * delete record
	 * @param data data could be id {number} or record {have a field named id}
	 * @param url url
	 */
	delete<T>(data: T, url: string): Observable<T> {
		const id = typeof data === 'number' ? data : data['id'];
		const deleteURL = `${url}/${id}`;
		return this.http.delete<T>(deleteURL, this.httpOptions);
	}

	/**
	 * delete many records
	 * @param data list of record []
	 * @param url url
	 */
	deleteBulk<T>(data: T[], url: string): Observable<T> {
		let options = {
			headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
			body: data
		}
		return this.http.delete<T>(url, options);
	}

	/**
	 * update record
	 * @param data the record need to be updated
	 * @param url url
	 */
	update<T>(data: T[], url: string): Observable<T> {
		return this.http.put<T>(url, data, this.httpOptions);
	}
}
