/**!
 * Defferred is A custom Promise method library v1.0.0
 * @license MIT License
 * @version 1.0.0
 * 
 * @see https://github.com/jqrony/defferred
 * 
 * @author Shahzada Modassir <codingmodassir@gmail.com>
 * Date: 11 June 2024 AT 10:49 AM (India)
 */
(function(global) {

/**
 * Inject [use strict] Mode
 * ------------------------
 * Throw ReferenceError when pass undeclare variables
 */
'use strict';

var rnowhite = (/[^\x20\r\t\n]/g);

/**
 * 
 */
function setOpt(options) {
  var object = [];
  each(rnowhite.exec(options)||[], function(_, flag) {
    object[flag] = true;
  });
  return object;
}

/**
 * 
 */
function each(obj, callback) {

}

/**
 * 
 */
function isFunction(obj) {
  return typeof obj === 'function' && typeof obj.nodeType !== 'number' &&
    typeof obj.items !== 'function';
}

/**
 * 
 */
function Firebacks(options) {
  var memory = data, callback, extractQueue, fn,
    argument,
    queue = {
      "progress": [], "done": [], "fail": []
    },
    cache = {
      insert: function () {

        argument = arguments[0];

        while (argument) {
          if (isFunction(argument)) {
            fn = argument;
            break;
          } else {
            argument = argument[0];
          }
        }

        if (isFunction(fn)) {
          push.call(queue[memory], fn);
        }

        return this;
      },
      fireWith: function (context, args) {
        extractQueue = queue[memory];

        while ((callback = extractQueue.shift())) {
          callback.apply(context, args);
        }
        return this;
      }
    };
  return cache;
}

/**
 * 
 */
function Defferred(callback) {
  var tupples = [

    // Promise +With, handlers, insert-fire memory data
    // Action insert listener, callbacks, with promise
    ["notify", "progress", Firebacks("progress"),
      // * 303 :running
      303, "running", 2],
    ["resolve", "done", Firebacks("done"),
      // * 204 :resolved
      204, "resolved", 0],
    ["reject", "fail", Firebacks("fail"),
      // * 408 :rejected
      408, "rejected", 1]
  ],
    state = "pending",
    decideredCode = 104, // * 104 :pending decideredCode
    promise = {
      decideredCode: function () {
        return decideredCode;
      },
      state: function () {
        return state;
      },
      always: function () {
        defferred.done(arguments).fail(arguments);
        return this;
      },
      "catch": function (fn) {
        return promise.then(null, fn);
      },
      pipe: function ( /* fnDone, fnFail, fnProgress */) {
        var argument = arguments;
        return Defferred(function (newDefferred) {
          each(tupples, function (_i, tupple) {

            var fn = isFunction(argument[tupple[5]]) && argument[tupple[5]];

            defferred[tupple[1]](function () {
              var returned = fn && fn.apply(this, arguments);

              /*
                  * onFulFilled = fnDone, Handle then all done!
                  * onRejected = fnFail, Handle failiur schuation
                  * onProgress = fnProgress, Handle progress
                  */
              if (returned && isFunction(returned.promise)) {
                returned.promise()
                  .progress(newDefferred.notify)
                  .done(newDefferred.resolve)
                  .fail(newDefferred.reject);
              } else {
                newDefferred[tupple[0] + "With"](
                  this,
                  fn ? [returned] : arguments
                );
              }
            });
          });
          argument = null;
        }).promise();
      },
      then: function (onFulfilled, onRejected, onProgress) {
        return Defferred(function (_newDefferred) {
          return defferred
            /*
                * onFulFilled, Handle then all done!
                * onRejected, Handle failiur schuation
                * onProgress, Handle progress running
                */
            .done(onFulfilled)       // fullFilled
            .fail(onRejected)        // rejected ! failed
            .progress(onProgress);   // progress ! running
        }).promise();
      },
      // Get a promise for this defferred
      // If obj is provided, the promise aspect is added to the object
      promise: function (obj) {
        return obj != null ? extend(obj, promise) : promise;
      }
    },
    defferred = {};

  // Add list-specific methods
  each(tupples, function (_i, tupple) {
    var statusCode = tupple[3], data = tupple[2],
      statusText = tupple[4];

    // promise.progress = data.insert
    // promise.done = data.insert
    // promise.fail = data.insert
    promise[tupple[1]] = data.insert;

    if (statusText) {
      data.insert(
        function () {
          // Update state value
          // state = "resolved"
          // state = "rejected"
          state = statusText;
        }
      );
    }

    if (statusCode) {
      data.insert(
        function () {
          // Update decideredCode value
          // DONE = 303
          // DONE = 204
          // DONE = 408
          decideredCode = statusCode;
        }
      );
    }

    // defferred.notify = ƒ () { defferred.notifyWith(...) }
    // defferred.reject = ƒ () { defferred.rejectWith(...) }
    // defferred.resolve = ƒ () { defferred.resolveWith(...) }
    defferred[tupple[0]] = function () {
      defferred[tupple[0] + "With"](this === defferred ? undefined : this, arguments);
      return this;
    };

    // defferred.notifyWith = data.fireWith
    // defferred.resolveWith = data.fireWith
    // defferred.rejectWith = data.fireWith
    defferred[tupple[0] + "With"] = data.fireWith;
  });

  // Make the defferred a promise
  promise.promise(defferred);

  // Call given func if any
  if (isFunction(callback)) {
    callback.call(defferred, defferred);
  }

  // All done!
  return defferred;
}

Defferred.Firebacks = Defferred.prototype.Firebacks = Firebacks;

// EXPOSE

// Register as named AMD module, since Codecore can be concatenated with
// other files that may use define
if (typeof define === 'function' && define.amd) {
  define(function() {return Defferred});
}

// For CommonJS and CommonJS-like environments
// (such as Node.js) expose a factory as module.exports
else if (typeof module === 'object' && module.exports) {
  module.exports = Defferred;
}

// Attach Defferred in `window` with Expose Defferred Identifiers, AMD
// CommonJS for browser emulators (trac-13566)
else {
  global.Defferred = Defferred;
}

// EXPOSE

})(this);
