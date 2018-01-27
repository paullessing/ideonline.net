const compiler = require('expression-sandbox');

const evaluate = (code) => compiler(`(function() {
  var console = {
    _history: [],
    log: function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      console._history.push({ method: 'log', args: args });
    },
    error: function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      console._history.push({ method: 'error', args: args });
    },
    warn: function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      console._history.push({ method: 'warn', args: args });
    },
    info: function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      console._history.push({ method: 'info', args: args });
    },
    debug: function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      console._history.push({ method: 'debug', args: args });
    }
  };
  var returnValue = (function() { ${code} })();
  return JSON.stringify([returnValue, console._history]);
})()`)({ JSON, Object });

window.evalToConsole = (code) => {
  const result = evaluate(code);
  return result;
};
