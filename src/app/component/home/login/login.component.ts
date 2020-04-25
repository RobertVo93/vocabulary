import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	constructor(private authService: AuthService, private router: Router, private alertService: AlertService) { }
	form: FormGroup;

	ngOnInit() {
		this.form = new FormGroup({
			email: new FormControl('', [
				Validators.required
			]),
			password: new FormControl('', [
				Validators.required
			])
		});
	}

	login(form) {
		console.log(form.value);
		this.authService.signIn(form.value).subscribe(() => {
			console.log("Logged in!");
			this.router.navigateByUrl('home');
		});
	}

	onSubmit() {
		this.authService.signIn(this.form.getRawValue()).subscribe(
			() => {
				console.log("Logged in!");
				this.router.navigateByUrl('');
			}
			,(err) => {
				this.alertService.error(err);
			}
		);
	}

}
