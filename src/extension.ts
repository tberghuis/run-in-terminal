import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "run-in-terminal" is now active!'
  );

  const runLineInTerminalDisposable = vscode.commands.registerCommand(
    "run-in-terminal.runLineInTerminal",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const startLine = findStatementStartLine(editor);
      // console.log("startLine", startLine);
      const endLine = findStatementEndLine(editor);
      // console.log("endLine", endLine);

      const range = new vscode.Range(
        startLine,
        0,
        endLine,
        editor.document.lineAt(endLine).text.length
      );
      const text = editor.document.getText(range);
      // console.log("Selected text:", text);

      const terminal =
        vscode.window.activeTerminal || vscode.window.createTerminal();
      terminal.show();
      terminal.sendText(text);
      vscode.window
        .showTextDocument(editor.document, { preserveFocus: false })
        .then(() => {
          vscode.commands.executeCommand(
            "workbench.action.focusActiveEditorGroup"
          );
        });

      const newPosition = new vscode.Position(endLine + 1, 0);
      editor.selection = new vscode.Selection(newPosition, newPosition);
    }
  );

  context.subscriptions.push(runLineInTerminalDisposable);
}

export function deactivate() {}

function findStatementStartLine(editor: vscode.TextEditor): number {
  let line = editor.selection.active.line;
  while (true) {
    if (line === 0) return 0;
    const prevLineText = editor.document.lineAt(line - 1).text;
    if (!prevLineText.endsWith("\\")) return line;
    line--;
  }
}

function findStatementEndLine(editor: vscode.TextEditor): number {
  let line = editor.selection.active.line;
  while (true) {
    if (line + 1 === editor.document.lineCount) return line;
    if (!editor.document.lineAt(line).text.endsWith("\\")) return line;
    line++;
  }
}