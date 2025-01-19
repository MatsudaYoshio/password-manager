import { dialog } from "electron";

class QuestionDialog {
  static readonly dialogResponses = Object.freeze({
    NO: {
      text: "No",
      id: 0,
    },
    YES: {
      text: "Yes",
      id: 1,
    },
  });

  async showMessageBox(questionMessage: string, yesCallback: () => boolean): Promise<boolean> {
    try {
      const result = await dialog.showMessageBox({
        type: "question",
        message: questionMessage,
        buttons: Object.values(QuestionDialog.dialogResponses).map((response) => response.text),
        defaultId: QuestionDialog.dialogResponses.YES.id,
        cancelId: QuestionDialog.dialogResponses.NO.id,
      });

      if (result.response === QuestionDialog.dialogResponses.YES.id) return yesCallback();
    } catch (err) {
      console.log("Error: ", err);
    }
    return false;
  }
}

export default QuestionDialog;
