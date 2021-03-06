import * as vscode from "vscode";
import { Common } from "./common";
import Compiler from "./compiler";

class Preview implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {

    const i18nKey: string = this.getI18nkey(document, position);
    if (!i18nKey) {
      return new vscode.Hover('');
    }
    if (!Common.validConfigPath()) {
      Common.doPromptConfigLocale();
    }

    const text: string = this.render(i18nKey);
    const contents: vscode.MarkdownString = new vscode.MarkdownString(text);
    return new vscode.Hover(contents);
  }

  getI18nkey(document: vscode.TextDocument, position: vscode.Position): string {
    const range: vscode.Range | undefined = document.getWordRangeAtPosition(
      position,
      /t\([^\)]+\)/gi
    );
    if (!range) {
      return "";
    }
    const text: string = document.getText(range);
    return text.replace(/t\(|\)|'|"/gi, "");
  }

  render(i18nKey: string): string {
    const data = Common.getData();
    const html: Array<string> = [];

    Object.keys(data).map((langType: string) => {
      const compiler = new Compiler();
      const source = data[langType];
      const value = compiler.toText(i18nKey,source);
      if (value) {
        html.push(this.formatter(langType, value));
      }else{
        //Fix:https://github.com/pfzhengd/vue-i18n-manage/issues/2
        html.push(this.formatter(langType,`"${i18nKey}" is undefined.`));
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
