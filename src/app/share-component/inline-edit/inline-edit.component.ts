import { Component, Input, Optional, Host } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'inline-edit',
	styleUrls: ['inline-edit.component.scss'],
	template: `
    <div *ngIf="!Readonly">
      <form (ngSubmit)="onSubmit()">
          <div class="mat-subheading-2">Add a text</div>
          
          <mat-form-field>
            <textarea rows="10" matInput maxLength="1000" name="comment" [(ngModel)]="comment"></textarea>
            <mat-hint align="end">{{comment?.length || 0}}/1000</mat-hint>
          </mat-form-field>

          <div class="actions">
            <button mat-button type="submit" color="primary">SAVE</button>
            <button mat-button type="button" class="red" (click)="onCancel()">CANCEL</button>
          </div>
        </form>
    </div>
    
    <div *ngIf="Readonly" class="readonly-element">
        <div rows="10" [innerHTML]="comment"></div>
        <mat-hint align="end">{{comment?.length || 0}}/1000</mat-hint>
    </div>
  `
})
export class InlineEditComponent {

	/** Overrides the comment and provides a reset value when changes are cancelled. */
	@Input('readonly') Readonly: string;
	@Input()
	get value(): string { return this._value; }
	set value(x: string) {
		this.comment = this._value = x;
	}
	private _value = '';

	/** Form model for the input. */
	comment = '';

	constructor(@Optional() @Host() public popover: SatPopover) { }

	ngOnInit() {
		// subscribe to cancellations and reset form value
		if (this.popover) {
			this.popover.closed.pipe(filter(val => val == null))
				.subscribe(() => this.comment = this.value || '');
		}
	}

	onSubmit() {
		if (this.popover) {
			this.popover.close(this.comment);
		}
	}

	onCancel() {
		if (this.popover) {
			this.popover.close();
		}
	}
}