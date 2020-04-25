import { popupActions } from './popupActions';

export interface DialogData {
	title: string;				//title of dialog
	message: string;			//message in header of dialog
	record: any;				//the record data
	questions: any;				//the record data template => create new form
	action: popupActions;		//list of action [Save, cancel]
	returnAction: string;		//return action like "save", "cancel" => refer Config.returnAction
}