import { QuestionBase } from './question-base';

export class HTMLViewerQuestion extends QuestionBase<string> {
  controlType = 'htmlviewer';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}
