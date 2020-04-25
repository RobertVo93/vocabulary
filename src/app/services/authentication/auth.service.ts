import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

import { Users } from 'src/app/class/users';
import { JwtResponse } from '../../interface/jwt-response';
import { Config } from '../../configuration/config';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	AUTH_SERVER: string = '';
	private currentUserSubject: BehaviorSubject<JwtResponse>;
    public currentUser: Observable<JwtResponse>;

	constructor(private httpClient: HttpClient, private config: Config) {
		this.AUTH_SERVER = this.config.apiServiceURL.server;
		this.currentUserSubject = new BehaviorSubject<JwtResponse>(JSON.parse(localStorage.getItem('CURRENT_USER')));
        this.currentUser = this.currentUserSubject.asObservable();
	}

    public get currentUserValue(): JwtResponse {
        return this.currentUserSubject.value;
    }

	register(user: Users): Observable<JwtResponse> {
		return this.httpClient.post<JwtResponse>(`${this.AUTH_SERVER}/register`, user).pipe(
			tap((res: JwtResponse) => {

				if (res) {
					localStorage.setItem("CURRENT_USER", JSON.stringify(res));
					this.currentUserSubject.next(res);
				}
			})

		);
	}

	signIn(user: Users): Observable<JwtResponse> {
		return this.httpClient.post(`${this.AUTH_SERVER}/login`, user).pipe(
			tap(async (res: JwtResponse) => {

				if (res) {
					localStorage.setItem("CURRENT_USER", JSON.stringify(res));
					this.currentUserSubject.next(res);
				}
			})
		);
	}

	signOut() {
		localStorage.removeItem("CURRENT_USER");
        this.currentUserSubject.next(null);
	}

}
