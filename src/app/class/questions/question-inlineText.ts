import { QuestionBase } from './question-base';

export class InlineTextQuestion extends QuestionBase<string> {
  controlType = 'inlineText';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}
