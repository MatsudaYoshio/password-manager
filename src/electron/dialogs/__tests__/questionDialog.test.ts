import { dialog } from 'electron';
import QuestionDialog from '../questionDialog';

// Electronのdialogをモック
jest.mock('electron', () => ({
  dialog: {
    showMessageBox: jest.fn()
  }
}));

describe('QuestionDialog', () => {
  let questionDialog: QuestionDialog;
  let mockYesCallback: jest.Mock;
  let mockNoCallback: jest.Mock;

  beforeEach(() => {
    questionDialog = new QuestionDialog();
    mockYesCallback = jest.fn();
    mockNoCallback = jest.fn();
    jest.clearAllMocks();
  });

  describe('dialogResponses', () => {
    test('should have correct response definitions', () => {
      expect(QuestionDialog.dialogResponses.YES).toEqual({
        text: 'Yes',
        id: 1
      });
      expect(QuestionDialog.dialogResponses.NO).toEqual({
        text: 'No',
        id: 0
      });
    });

    test('should be frozen', () => {
      expect(Object.isFrozen(QuestionDialog.dialogResponses)).toBe(true);
    });
  });

  describe('showMessageBox', () => {
    test('should call dialog.showMessageBox with correct parameters', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({
        response: QuestionDialog.dialogResponses.YES.id
      });

      await questionDialog.showMessageBox('Test question?', mockYesCallback, mockNoCallback);

      expect(dialog.showMessageBox).toHaveBeenCalledWith({
        type: 'question',
        message: 'Test question?',
        buttons: [QuestionDialog.dialogResponses.NO.text, QuestionDialog.dialogResponses.YES.text],
        defaultId: QuestionDialog.dialogResponses.YES.id,
        cancelId: QuestionDialog.dialogResponses.NO.id
      });
    });

    test('should call yesCallback when YES is selected', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({
        response: QuestionDialog.dialogResponses.YES.id
      });

      await questionDialog.showMessageBox('Test question?', mockYesCallback, mockNoCallback);

      expect(mockYesCallback).toHaveBeenCalledTimes(1);
      expect(mockNoCallback).not.toHaveBeenCalled();
    });

    test('should call noCallback when NO is selected', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({
        response: QuestionDialog.dialogResponses.NO.id
      });

      await questionDialog.showMessageBox('Test question?', mockYesCallback, mockNoCallback);

      expect(mockNoCallback).toHaveBeenCalledTimes(1);
      expect(mockYesCallback).not.toHaveBeenCalled();
    });

    test('should work without callbacks', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({
        response: QuestionDialog.dialogResponses.YES.id
      });

      await expect(questionDialog.showMessageBox('Test question?')).resolves.not.toThrow();
    });

    test('should handle errors gracefully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const error = new Error('Dialog error');
      (dialog.showMessageBox as jest.Mock).mockRejectedValue(error);

      await questionDialog.showMessageBox('Test question?', mockYesCallback, mockNoCallback);

      expect(consoleLogSpy).toHaveBeenCalledWith('[Error Log]', error);
      expect(mockYesCallback).not.toHaveBeenCalled();
      expect(mockNoCallback).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    test('should not call any callback for unexpected response', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 999 });

      await questionDialog.showMessageBox('Test question?', mockYesCallback, mockNoCallback);

      expect(mockYesCallback).not.toHaveBeenCalled();
      expect(mockNoCallback).not.toHaveBeenCalled();
    });
  });
});
