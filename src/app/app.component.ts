import { Component } from '@angular/core';
import { JwtResponse } from './interface/jwt-response';
import { AuthService } from './services/authentication/auth.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	currentUser: JwtResponse;
	navbarOpen = false;
	title = 'vocabulary';

    constructor(private authenticationService: AuthService) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    }

    signOut() {
        this.authenticationService.signOut();
    }
	toggleNavbar() {
		this.navbarOpen = !this.navbarOpen;
	}
}
