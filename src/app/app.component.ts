import { Component } from '@angular/core';
import { ConsoleCall, evalConsole, printConsoleCalls } from './eval';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isError: boolean;
  public consoleOutput: string;

  public run(code: string): void {
    const consoleCalls = evalConsole(code);

    if (consoleCalls.hasOwnProperty('error')) {
      this.consoleOutput= (consoleCalls as { error: any }).error.toString();
      this.isError = true;
    } else {
      this.isError = false;
      this.consoleOutput = (consoleCalls as ConsoleCall[])
        .map((call) => [call.method.toUpperCase(), ...call.args
          .map((arg: any) => typeof arg === 'string' ? arg : JSON.stringify(arg))
        ].join(' '))
        .join('\n');
    }

    printConsoleCalls(consoleCalls);
  }
}
