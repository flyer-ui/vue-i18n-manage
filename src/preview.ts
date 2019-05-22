import * as vscode from "vscode";
import * as common from "./common";

class Preview implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const i18nKey: string = this.getI18nkey(document, position);
    const text: string = this.render(i18nKey);
    const contents: vscode.MarkdownString = new vscode.MarkdownString(text);
    return new vscode.Hover(contents);
  }

  getI18nkey(document: vscode.TextDocument, position: vscode.Position): string {
    const range: vscode.Range | undefined = document.getWordRangeAtPosition(
      position,
      /\$t\([^\)]+\)/gi
    );
    if (!range) {
      return "";
    }
    const text: string = document.getText(range);
    return text.replace(/\$t|\(|\)|'|"/gi, "");
  }

  render(i18nKey: string): string {
    const data = common.Common.getData();
    const html: Array<string> = [];
    Object.keys(data).map((key: string) => {
      const value = data[key][i18nKey];
      if (value) {
        html.push(this.formatter(key, value));
      }
    });
    return html.join("\n\n");
  }

  formatter(key: string, value: string): string {
    return `**${key}**: ${value}`;
  }
}

export default () => {
  return vscode.languages.registerHoverProvider(
    [
      { language: "vue", scheme: "*" },
      { language: "javascript", scheme: "*" },
      { language: "typescript", scheme: "*" }
    ],
    new Preview()
  );
};
