import { CallbackReturn } from '../../interface/callbackReturn';

export class QuestionBase<T> {
	value: T;
	key: string;
	label: string;
	required: boolean;
	order: number;
	controlType: string;
	type: string;
	options: { key: string, value: string }[];
	validators: any;
	multiple: boolean;    //dropdown list multiple
	rows: number;       //number of rows in text area
	readonly: boolean;  //question is readonly or not
	changeHandlerCallbackFunction: any; // callback function handle the question change if needed

	constructor(options: {
		value?: T,
		key?: string,
		label?: string,
		required?: boolean,
		order?: number,
		controlType?: string,
		type?: string,
		validators?: any,
		multiple?: boolean,
		rows?: number,
		readonly?: boolean,
		changeHandlerCallbackFunction?: () => CallbackReturn
	} = {}) {
		this.value = options.value;
		this.key = options.key || '';
		this.label = options.label || '';
		this.required = !!options.required;
		this.order = options.order === undefined ? 1 : options.order;
		this.controlType = options.controlType || '';
		this.type = options.type || '';
		this.validators = options.validators || [];
		this.multiple = !!options.multiple;
		this.rows = options.rows === undefined ? 1 : options.rows;
		this.readonly = !!options.readonly;
		this.changeHandlerCallbackFunction = options.changeHandlerCallbackFunction;
	}
}
