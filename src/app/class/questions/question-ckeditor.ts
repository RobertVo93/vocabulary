import { QuestionBase } from './question-base';

export class CkeditorQuestion extends QuestionBase<string> {
  controlType = 'ckeditor';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}
