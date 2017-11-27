import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConsoleCall, evalToConsole, printConsoleCalls } from './eval';

export const KEYS = [
  ';',
  ':',
  '{',
  '}',
  '\'',
  '`',
  '|',
  '[',
  ']',
  '$',
  '*',
  '/',
  '\\',
  '<',
  '>',
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isError: boolean;
  public consoleOutput: string;

  public keys: string[] = KEYS;

  @ViewChild('js')
  public jsTextArea: ElementRef;

  public run(code: string): void {
    this.isError = false;

    if (!code || !code.trim().length) {
      this.isError = true;
      this.consoleOutput = 'No input';
      return;
    }

    const evalResult = evalToConsole(code);
    // console.log(evalResult);
    // TODO hard fail when last statement in code is return

    if (evalResult.error) {
      this.consoleOutput = evalResult.error.toString();
      this.isError = true;
    } else if (evalResult.consoleCalls.length || typeof evalResult.result !== 'undefined') {
      this.consoleOutput = evalResult.consoleCalls
        .map((call) => [call.method.toUpperCase(), ...call.args
          .map((arg: any) => this.stringify(arg))
        ].join(' '))
        .concat(typeof evalResult.result !== 'undefined' ? [this.stringify(evalResult.result)] : [])
        .join('\n');
    } else {
      this.consoleOutput = 'No output';
    }
  }

  public onKeypress(key: string): void {
    const textarea = this.jsTextArea.nativeElement as HTMLTextAreaElement;
    this.insertText(textarea, key);

    // TODO longpress for special alternatives? e.g. '->" or block for loop stuff
  }

  private insertText(textarea: HTMLTextAreaElement, text: string): void {
    const oldText = textarea.value;
    const textPre = oldText.substring(0, textarea.selectionStart);
    const textPost = oldText.substring(textarea.selectionEnd);
    const selectionStart = textarea.selectionStart + 1;
    textarea.value = `${textPre}${text}${textPost}`;
    textarea.setSelectionRange(selectionStart, selectionStart);
    textarea.focus();
  }

  private stringify(value: any): string {
    if (typeof value === 'string') {
      return value;
    } else {
      return JSON.stringify(value);
    }
  }
}
