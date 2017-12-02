// tslint:disable-next-line:no-unused no-shadowed-variable no-var-keyword prefer-const no-unnecessary-initializer
// var globals = Object.getOwnPropertyNames(this);
// console.log(globals);

export interface EvalResult {
  error?: any;
  consoleCalls: ConsoleCall[];
  result?: any;
}

export interface ConsoleCall {
  method: 'log' | 'info' | 'debug' | 'warn' | 'error';
  args: any[];
}

export function safeEval(): (op: string) => any {
  let clearGlobals = '';
  for (const global of Object.getOwnPropertyNames(window).sort()) {
    if (['eval', 'arguments'].indexOf(global) < 0 && global.indexOf('-') < 0) {
      clearGlobals += 'var ' + global + ' = undefined;';
    }
  }
  // console.log(clearGlobals);
  return function (operation: string): any {
    operation = operation.replace('this', '_this');
    // console.log(operation)
    // tslint:disable-next-line:no-eval
    return eval(`
      (function() {
        ${clearGlobals};
        var clearGlobals = undefined;
        return ${operation};
      })()`);
  };
}

export function evalToConsole(code: string): EvalResult {
  // tslint:disable-next-line:no-unused no-shadowed-variable no-var-keyword prefer-const no-unnecessary-initializer
  const wrappedCode = `(function() {
      var code = undefined;
      var console = {
        _history: [],
        log: function() {
          var args = [];
          for (let i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          console._history.push({ method: 'log', args: args });
        },
        error: function() {
          var args = [];
          for (let i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          console._history.push({ method: 'error', args: args });
        },
        warn: function() {
          var args = [];
          for (let i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          console._history.push({ method: 'warn', args: args });
        },
        info: function() {
          var args = [];
          for (let i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          console._history.push({ method: 'info', args: args });
        },
        debug: function() {
          var args = [];
          for (let i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          console._history.push({ method: 'debug', args: args });
        }
      };
      var returnValue = (function() { ${code} })();
      return [returnValue, console._history];
    })()`;

  try {
    const [result, consoleCalls] = safeEval()(wrappedCode) as [any, ConsoleCall[]];
    return {
      result,
      consoleCalls
    };
  } catch (error) {
    return {
      error,
      consoleCalls: []
    };
  }
}

export function printConsoleCalls(calls) {
  for (const entry of calls) {
    if (['log', 'error', 'warn', 'info', 'debug'].indexOf(entry.method) >= 0) {
      console[entry.method].apply(console, entry.args);
    }
  }
}
