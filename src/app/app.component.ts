import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { evalToConsole } from './eval';
import * as download from 'downloadjs';

export const KEYS = {
  ';':  ';',
  ':':  ':',
  '{':  '{',
  '}':  '}',
  '(':  '(',
  ')':  ')',
  '\'': '\'',
  '`':  '`',
  '|':  '|',
  '[':  '[',
  ']':  ']',
  '$':  '$ ',
  '*':  '*',
  '/':  '/',
  '\\': '\\',
  '<':  '<',
  '>':  '>',
  '=>': '=>',
  'f':  'function ',
  'c':  'const ',
  'l':  'let ',
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isError: boolean;
  public consoleOutput: string;
  public hasStoredCode: boolean;

  public keys: string[] = Object.keys(KEYS);

  @ViewChild('js')
  public jsTextArea: ElementRef;

  // TODO extract textarea to separate component
  // TODO tab and untab buttons, working with multi select
  // TODO navigation keys (up down left right)

  private get textarea(): HTMLTextAreaElement {
    return this.jsTextArea.nativeElement;
  }

  public ngOnInit(): void {
    this.hasStoredCode = !!localStorage.getItem('js');
  }

  public run(code: string): void {
    this.isError = false;

    if (!code || !code.trim().length) {
      this.isError = true;
      this.consoleOutput = 'No input';
      return;
    }

    const evalResult = evalToConsole(code);
    if (evalResult.error) {
      this.consoleOutput = evalResult.error.toString();
      this.isError = true;
    } else if (evalResult.consoleCalls.length || typeof evalResult.result !== 'undefined') {
      this.consoleOutput = evalResult.consoleCalls
        .map((call) => [call.method.toUpperCase(), ...call.args
          .map((arg: any) => this.stringify(arg))
        ].join(' '))
        .concat(typeof evalResult.result !== 'undefined' ? ['RETURN ' + this.stringify(evalResult.result)] : [])
        .join('\n');
    } else {
      this.consoleOutput = 'No output';
    }
  }

  public onKeypress(key: string): void {
    this.insertText(KEYS[key]);

    // TODO longpress for special alternatives? e.g. '->" or block for loop stuff
  }

  public onTextareaKeydown($event: KeyboardEvent): void {
    if ($event.key === 'Enter') {
      $event.preventDefault();
      const caretPos = this.textarea.selectionStart;
      const text = this.textarea.value.substring(0, caretPos);
      const lines = text.split(/$\n/gm);
      const lastLine = lines[lines.length - 1];
      const indent = lastLine.match(/^(\s*)/)[0];
      const isLastCharacterOpening = lastLine.match(/([{(\[])\s*$/);
      let textToInsertBeforeCaret = '\n' + indent;
      let textToInsertAfterCaret = '';
      if (isLastCharacterOpening) {
        textToInsertBeforeCaret += '  ';
        textToInsertAfterCaret += '\n' + indent + this.getClosingBrace(isLastCharacterOpening[1]) + '\n';
      }
      const newCaretPos = caretPos + textToInsertBeforeCaret.length;
      this.insertText(textToInsertBeforeCaret + textToInsertAfterCaret, newCaretPos);

      // TODO could do something cleverer here like other IDEs
    }
  }

  public save(text: string): void {
    localStorage.setItem('js', text);
    this.hasStoredCode = !!text;
  }

  public load(): void {
    const stored = localStorage.getItem('js');
    if (stored) {
      this.jsTextArea.nativeElement.value = stored;
    }
  }

  public download(): void {
    const text = this.textarea.value;
    const filename = window.prompt('Enter filename:');
    if (filename) {
      download(text, filename, 'application/javascript');
    }
  }

  private getClosingBrace(opening?: string): string {
    return {
      '{': '}',
      '[': ']',
      '(': ')'
    }[opening] || '';
  }

  private insertText(text: string, caretPos?: number): void {
    const textarea = this.textarea;
    const oldText = textarea.value;
    const textPre = oldText.substring(0, textarea.selectionStart);
    const textPost = oldText.substring(textarea.selectionEnd);
    const selectionStart = textarea.selectionStart + text.length;
    textarea.value = `${textPre}${text}${textPost}`;
    if (typeof caretPos !== 'undefined') {
      textarea.setSelectionRange(caretPos, caretPos);
    } else {
      textarea.setSelectionRange(selectionStart, selectionStart);
      textarea.focus();
    }
  }

  private stringify(value: any): string {
    if (typeof value === 'string') {
      return value;
    } else {
      return JSON.stringify(value);
    }
  }
}
