module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1631082538633, function(require, module, exports) {
/*!
* MpKit v1.1.1
* (c) 2020-2021 imingyu<mingyuhisoft@163.com>
* Released under the MIT License.
* Github: https://github.com/imingyu/mpkit/tree/master/packages/func-helper
*/


Object.defineProperty(exports, '__esModule', { value: true });

function replaceFunc(original, replacer, callback, data) {
  var isReplace = true;
  callback && callback({
    data: data,
    original: original,
    replace: function replace() {
      isReplace = true;
    },
    restore: function restore() {
      isReplace = false;
    }
  });
  return function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    if (isReplace) {
      return replacer.apply(this, args);
    } else {
      return original.apply(this, args);
    }
  };
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

/**使用多种钩子钩住函数，并返回处理后的函数 */
var hookFunc = function () {
  var isFunc = function isFunc(item) {
    return typeof item === "function" || Array.isArray(item) && item.some(function (it) {
      return typeof it === "function";
    });
  };

  var hookNames = ["before", "after", "catch", "complete", "done"];
  return function (func, hooksInvariant, hooks, otherState) {
    var enabled = {
      before: 1,
      after: 1,
      "catch": 1,
      complete: 1,
      done: 1
    };
    var has = {};

    var hasHook = function hasHook(name) {
      if (!hooksInvariant) {
        // 如果hooks不是恒定的，则需要每次动态查询
        return hooks.some(function (item) {
          return item && isFunc(item[name]);
        });
      }

      if (!(name in has)) {
        hooks.forEach(function (item) {
          if (!item) {
            return;
          }

          hookNames.forEach(function (n) {
            if (isFunc(item[n])) {
              has[n] = 1;
            }
          });
        });
        hookNames.forEach(function (n) {
          if (!(n in has)) {
            has[n] = 0;
          }
        });
      }

      return has[name];
    };

    var targetFunc = function MkFuncHelperOfHookTarget() {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      var ctx = this;
      var state = {
        ctx: ctx,
        func: func,
        args: args,
        state: {},
        stepResultList: [],
        doneCallback: function doneCallback(err, res) {
          if (state.done) {
            return;
          }

          if (err) {
            fireCatch("RejectReason", err);
            state.fulfilled = false;
          } else {
            state.value = res;
            state.fulfilled = true;
          }

          fireHook("complete");
          checkFireDone("callback");
        }
      };

      if (otherState) {
        Object.assign(state.state, otherState);
      }

      var fireHook = function fireHook(name) {
        if (name !== "done" && name !== "catch" && state.stop) {
          return;
        }

        var needExec = !enabled[name] ? false : hooksInvariant ? hasHook(name) : true;

        if (needExec) {
          try {
            for (var i = 0, len = hooks.length; i < len; i++) {
              var hook = hooks[i];

              if (hook && hook[name]) {
                if (Array.isArray(hook[name])) {
                  var list = hook[name];

                  for (var j = 0, lj = list.length; j < lj; j++) {
                    state.stepResultList.push({
                      step: name,
                      result: list[j] ? list[j](state) : undefined
                    });

                    if (name !== "done" && name !== "catch" && state.stop) {
                      break;
                    }
                  }
                } else {
                  state.stepResultList.push({
                    step: name,
                    result: hook[name](state)
                  });
                }
              }

              if (name !== "done" && name !== "catch" && state.stop) {
                break;
              }
            }
          } catch (e) {
            var type = "" + name[0].toUpperCase() + name.substr(1) + "Exception";

            if (name !== "catch") {
              fireCatch(type, e);
            } else {
              state.errors.push({
                type: type,
                error: e
              });
            }
          }
        }
      };

      var fireCatch = function fireCatch(type, error) {
        if (!state.errors) {
          state.errors = [];
        }

        state.errors.push({
          type: type,
          error: error
        });

        if (hasHook("catch")) {
          try {
            fireHook("catch");
          } catch (e) {
            state.errors.push({
              type: "CatchException",
              error: e
            });
          }
        }
      };

      var doneStep = {};

      var checkFireDone = function checkFireDone(step) {
        doneStep[step] = 1;
        var isPromise = _typeof(state.result) === "object" && state.result && (state.result.then || state.result["catch"]);

        if (state.needDoneCallback && isPromise) {
          if (doneStep.promise && doneStep.callback) {
            state.done = true;
            fireHook("done");
          }
        } else {
          state.done = true;
          fireHook("done");
        }
      };

      fireHook("before");

      if (state.stop) {
        fireHook("done");
        return state.result;
      }

      try {
        var res = func.apply(ctx, args);
        state.result = res;
        fireHook("after");
        var isPromise = _typeof(state.result) === "object" && state.result && (state.result.then || state.result["catch"]);

        if (state.needDoneCallback || isPromise) {
          if (isPromise && state.result.then) {
            state.result.then(function (value) {
              state.value = value;
              state.fulfilled = true;
              fireHook("complete");
              checkFireDone("promise");
            });
          }

          if (isPromise && state.result["catch"]) {
            state.result["catch"](function (e) {
              state.fulfilled = false;
              fireCatch("RejectReason", e);
              fireHook("complete");
              checkFireDone("promise");
            });
          }
        } else {
          fireHook("done");
        }

        return state.result;
      } catch (e) {
        fireCatch("MethodException", e);
        fireHook("done");
        throw e;
      }
    };

    return {
      func: targetFunc,
      disable: function disable(name) {
        if (name) {
          enabled[name] = 0;
        } else {
          hookNames.forEach(function (n) {
            enabled[n] = 0;
          });
        }
      },
      enable: function enable(name) {
        if (name) {
          enabled[name] = 1;
        } else {
          hookNames.forEach(function (n) {
            enabled[n] = 1;
          });
        }
      }
    };
  };
}();

exports.hookFunc = hookFunc;
exports.replaceFunc = replaceFunc;
//# sourceMappingURL=index.cjs.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1631082538633);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map