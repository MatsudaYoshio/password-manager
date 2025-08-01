import { dialog } from 'electron';

class QuestionDialog {
  static readonly dialogResponses = Object.freeze({
    NO: {
      text: 'No',
      id: 0
    },
    YES: {
      text: 'Yes',
      id: 1
    }
  });

  async showMessageBox(
    questionMessage: string,
    yesCallback: () => void = () => {},
    noCallback: () => void = () => {}
  ) {
    try {
      const result = await dialog.showMessageBox({
        type: 'question',
        message: questionMessage,
        buttons: Object.values(QuestionDialog.dialogResponses).map(response => response.text),
        defaultId: QuestionDialog.dialogResponses.YES.id,
        cancelId: QuestionDialog.dialogResponses.NO.id
      });

      if (result.response === QuestionDialog.dialogResponses.YES.id) yesCallback();
      if (result.response === QuestionDialog.dialogResponses.NO.id) noCallback();
    } catch (err) {
      console.log('[Error Log]', err);
    }
  }
}

export default QuestionDialog;
