module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1631082538635, function(require, module, exports) {
/*!
* MpKit v1.1.1
* (c) 2020-2021 imingyu<mingyuhisoft@163.com>
* Released under the MIT License.
* Github: https://github.com/imingyu/mpkit/tree/master/packages/util
*/


Object.defineProperty(exports, '__esModule', { value: true });

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

var uuid = function uuid() {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    // tslint:disable-next-line:no-bitwise
    var r = Math.random() * 16 | 0; // tslint:disable-next-line:no-bitwise

    var v = c === "x" ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};
var isNativeFunc = function isNativeFunc(func) {
  return func === Function || typeof func === "function" && func.toString().indexOf("[native code]") !== -1;
};
var isFunc = function isFunc(obj) {
  return typeof obj === "function";
};
var isPromise = function isPromise(obj) {
  return obj && obj.then;
};
var getMpPlatform = function () {
  var platform;
  return function () {
    if (platform) {
      return platform;
    }

    if ((typeof wx === "undefined" ? "undefined" : _typeof(wx)) === "object") {
      return platform = "wechat"
      /* wechat */
      ;
    }

    if ((typeof my === "undefined" ? "undefined" : _typeof(my)) === "object") {
      return platform = "alipay"
      /* alipay */
      ;
    }

    if ((typeof swan === "undefined" ? "undefined" : _typeof(swan)) === "object") {
      return platform = "smart"
      /* smart */
      ;
    }

    if ((typeof tt === "undefined" ? "undefined" : _typeof(tt)) === "object") {
      return platform = "tiktok"
      /* tiktok */
      ;
    }

    return platform = "unknown"
    /* unknown */
    ;
  };
}();
var getApiVar = function getApiVar() {
  var platform = getMpPlatform();

  if (platform === "wechat"
  /* wechat */
  && (typeof wx === "undefined" ? "undefined" : _typeof(wx)) === "object") {
    return wx;
  } else if (platform === "alipay"
  /* alipay */
  && (typeof my === "undefined" ? "undefined" : _typeof(my)) === "object") {
    return my;
  } else if (platform === "smart"
  /* smart */
  && (typeof swan === "undefined" ? "undefined" : _typeof(swan)) === "object") {
    return swan;
  } else if (platform === "tiktok"
  /* tiktok */
  && (typeof tt === "undefined" ? "undefined" : _typeof(tt)) === "object") {
    return tt;
  }
};
var getMpInitLifeName = function getMpInitLifeName(viewType) {
  if (viewType === "App"
  /* App */
  ) {
      return "onLaunch";
    }

  if (viewType === "Page"
  /* Page */
  ) {
      return "onLoad";
    }

  if (viewType === "Component"
  /* Component */
  ) {
      var mpPlatform = getMpPlatform();
      return mpPlatform !== "alipay"
      /* alipay */
      ? "created" : "onInit";
    }
};
var getMpMountLifeName = function getMpMountLifeName(viewType) {
  if (viewType === "App"
  /* App */
  ) {
      return "onShow";
    }

  if (viewType === "Page"
  /* Page */
  ) {
      return "onShow";
    }

  if (viewType === "Component"
  /* Component */
  ) {
      var mpPlatform = getMpPlatform();
      return mpPlatform !== "alipay"
      /* alipay */
      ? "attached" : "didMount";
    }
};
var initView = function initView(view, viewType) {
  defineViewType(view, viewType);
  defineViewKey(view);
};

var defineViewKey = function defineViewKey(view) {
  if (!view.$mkKeyIsDefine) {
    view.$mkKeyIsDefine = uuid();
    Object.defineProperty(view, "$mkKey", {
      get: function get() {
        return getMpNativeViewId(this, getMpViewType(this));
      }
    });
  }
};

var defineViewType = function defineViewType(view, value) {
  if (!view.$mkType) {
    Object.defineProperty(view, "$mkType", {
      value: value
    });
  }

  return value;
};

var getMpViewType = function getMpViewType(view) {
  if (getMpPlatform() === "unknown"
  /* unknown */
  ) {
      return;
    }

  if (!view.$mkType) {
    if ("route" in view || "__route__" in view) {
      return defineViewType(view, "Page"
      /* Page */
      );
    }

    if ("triggerEvent" in view) {
      return defineViewType(view, "Component"
      /* Component */
      );
    }

    if ("props" in view && getMpPlatform() === "alipay"
    /* alipay */
    ) {
        return defineViewType(view, "Component"
        /* Component */
        );
      }

    if (typeof getApp === "function" && getApp() === view) {
      return defineViewType(view, "App"
      /* App */
      );
    }

    return defineViewType(view, "Page"
    /* Page */
    );
  }

  return view.$mkType;
};
var getMpNativeViewId = function getMpNativeViewId(vm, viewType) {
  if (!viewType) {
    var tsViewType = getMpViewType(vm);

    if (tsViewType) {
      viewType = tsViewType;
    }
  }

  if (!viewType) {
    return;
  }

  var MP_PLATFORM = getMpPlatform();

  if (MP_PLATFORM === "unknown"
  /* unknown */
  ) {
      return "unknown";
    }

  if (viewType === "App"
  /* App */
  ) {
      return "app";
    }

  if (viewType === "Page"
  /* Page */
  ) {
      if (MP_PLATFORM === "wechat"
      /* wechat */
      ) {
          return vm.__wxWebviewId__ + "";
        }

      if (MP_PLATFORM === "alipay"
      /* alipay */
      ) {
          return vm.$viewId;
        }

      if (MP_PLATFORM === "tiktok"
      /* tiktok */
      ) {
          return vm.__webviewId__ + "";
        }

      if (MP_PLATFORM === "smart"
      /* smart */
      ) {
          defineViewKey(vm);
          return vm.$mkKey;
        }
    }

  if (viewType === "Component"
  /* Component */
  ) {
      if (MP_PLATFORM === "wechat"
      /* wechat */
      ) {
          return vm.$mkKeyIsDefine;
        }

      if (MP_PLATFORM === "alipay"
      /* alipay */
      ) {
          return vm.$id + "";
        }

      if (MP_PLATFORM === "tiktok"
      /* tiktok */
      ) {
          return vm.__nodeId__ + "";
        }

      if (MP_PLATFORM === "smart"
      /* smart */
      ) {
          return vm.nodeId;
        }
    }
};
var getMpComponentPageNativeViewId = function getMpComponentPageNativeViewId(vm) {
  var MP_PLATFORM = getMpPlatform();

  if (MP_PLATFORM === "wechat"
  /* wechat */
  ) {
      return vm.__wxWebviewId__ + "";
    }

  if (MP_PLATFORM === "alipay"
  /* alipay */
  ) {
      return getMpNativeViewId(vm.$page);
    }

  if (MP_PLATFORM === "tiktok"
  /* tiktok */
  ) {
      return vm.__webviewId__ + "";
    }

  if (MP_PLATFORM === "smart"
  /* smart */
  ) {
      return getMpNativeViewId(vm.pageinstance);
    }
};
var getMpViewPathName = function getMpViewPathName(viewType, vm) {
  if (viewType === "App"
  /* App */
  ) {
      return "app";
    }

  if (!vm) {
    return "";
  }

  var MP_PLATFORM = getMpPlatform();

  if (MP_PLATFORM === "wechat"
  /* wechat */
  ) {
      return vm.is;
    }

  if (MP_PLATFORM === "alipay"
  /* alipay */
  ) {
      if (viewType === "Page"
      /* Page */
      ) {
          return vm.route;
        }

      return vm.is;
    }

  if (MP_PLATFORM === "tiktok"
  /* tiktok */
  ) {
      return vm.is;
    }

  if (MP_PLATFORM === "smart"
  /* smart */
  ) {
      if (viewType === "Page"
      /* Page */
      ) {
          return vm.route;
        }

      return vm.is;
    }
};
var isMpIvew = function isMpIvew(view) {
  if (_typeof(view) === "object" && view && !isPlainObject(view)) {
    if (view.$mkType) {
      return true;
    }

    if (getMpViewType(view)) {
      return true;
    }
  }

  return false;
};
var clone = function clone(obj) {
  var type = _typeof(obj);

  if (type !== "object") {
    return obj;
  } else if (Array.isArray(obj)) {
    var res_1 = [];
    obj.forEach(function (item, index) {
      res_1[index] = clone(item);
    });
    return res_1;
  } else if (obj && isPlainObject(obj)) {
    return Object.keys(obj).reduce(function (sum, key) {
      sum[key] = clone(obj[key]);
      return sum;
    }, {});
  } else {
    return obj;
  }
};
function isPlainObject(value) {
  if (_typeof(value) !== "object") {
    return false;
  }

  if (value == null || Object.getPrototypeOf(value) === null) {
    return true;
  }

  var proto = value;

  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(value) === proto;
}
var isEmptyObject = function isEmptyObject(obj) {
  if (Array.isArray(obj)) {
    return !obj.length;
  }

  for (var prop in obj) {
    return false;
  }

  return true;
};
var isUndefined = function isUndefined(obj) {
  return typeof obj === "undefined";
};
var merge = function merge(source) {
  var targets = [];

  for (var _i = 1; _i < arguments.length; _i++) {
    targets[_i - 1] = arguments[_i];
  }

  if (!isValidObject(source, false)) {
    return source;
  }

  targets.forEach(function (target) {
    if (source === target) {
      return;
    }

    if (isValidObject(target)) {
      if (Array.isArray(target) && !Array.isArray(source)) {
        source = [];
      }

      Object.keys(target).forEach(function (prop) {
        if (prop === "__proto__") {
          return;
        }

        var value = target[prop];

        var valType = _typeof(value);

        if (valType === "object" && value && (isPlainObject(value) || Array.isArray(value))) {
          if (_typeof(source[prop]) !== "object") {
            source[prop] = Array.isArray(value) ? [] : {};
          }

          if (Array.isArray(value) && !value.length) ; else {
            source[prop] = merge(source[prop], value);
          }
        } else {
          source[prop] = value;
        }
      });
    } else if (Array.isArray(target)) {
      if (!likeArray(source)) {
        source = [];
      }
    }
  });
  return source;
};
var isValidObject = function isValidObject(obj, checkEmpty) {
  if (checkEmpty === void 0) {
    checkEmpty = true;
  }

  return _typeof(obj) === "object" && obj && (checkEmpty ? !isEmptyObject(obj) : true);
};
var nextCharCount = function nextCharCount(_char, charIndex, str) {
  var res = 0;

  if (charIndex + 1 >= str.length) {
    return res;
  }

  for (var i = charIndex + 1, len = str.length; i < len; i++) {
    var currentChar = str[i];

    if (currentChar !== _char) {
      break;
    }

    res++;
  }

  return res;
};
var firstAfterCharsIndex = function firstAfterCharsIndex(afterIndex, chars, str) {
  var index = str.substr(afterIndex + 1).indexOf(chars);

  if (index === -1) {
    return index;
  }

  return afterIndex + index;
};
var reolaceFileSuffix = function reolaceFileSuffix(fileName, suffix) {
  return fileName.substr(0, fileName.lastIndexOf(".")) + suffix;
};
var likeArray = function likeArray(obj) {
  return Array.isArray(obj) || _typeof(obj) === "object" && obj && typeof obj.length === "number" && obj.length;
};
var isValidMpPlatform = function isValidMpPlatform(platform) {
  return platform === "wechat"
  /* wechat */
  || platform === "alipay"
  /* alipay */
  || platform === "smart"
  /* smart */
  || platform === "tiktok"
  /* tiktok */
  ;
}; // export const like = (a, b) => {
//     if (a === b) {
//         return true;
//     }
//     const typeA = typeof a;
//     const typeB = typeof b;
//     if (typeA !== typeB) {
//         return false;
//     }
//     if (typeA !== "object") {
//         return false;
//     }
//     const arrA = Array.isArray(a);
//     const arrB = Array.isArray(b);
//     if (arrA !== arrB) {
//         return false;
//     }
//     // ???????????????
//     if (arrA) {
//         if (a.length !== b.length) {
//             return false;
//         }
//         return (a as any[]).every((item, index) => like(item, b[index]));
//     }
//     // ???????????????
//     const keysA = Object.keys(a);
//     const keysB = Object.keys(b);
//     if (!like(keysA, keysB)) {
//         return false;
//     }
//     return keysA.every((key) => like(a[key], b[key]));
// };

exports.clone = clone;
exports.firstAfterCharsIndex = firstAfterCharsIndex;
exports.getApiVar = getApiVar;
exports.getMpComponentPageNativeViewId = getMpComponentPageNativeViewId;
exports.getMpInitLifeName = getMpInitLifeName;
exports.getMpMountLifeName = getMpMountLifeName;
exports.getMpNativeViewId = getMpNativeViewId;
exports.getMpPlatform = getMpPlatform;
exports.getMpViewPathName = getMpViewPathName;
exports.getMpViewType = getMpViewType;
exports.initView = initView;
exports.isEmptyObject = isEmptyObject;
exports.isFunc = isFunc;
exports.isMpIvew = isMpIvew;
exports.isNativeFunc = isNativeFunc;
exports.isPlainObject = isPlainObject;
exports.isPromise = isPromise;
exports.isUndefined = isUndefined;
exports.isValidMpPlatform = isValidMpPlatform;
exports.isValidObject = isValidObject;
exports.likeArray = likeArray;
exports.merge = merge;
exports.nextCharCount = nextCharCount;
exports.reolaceFileSuffix = reolaceFileSuffix;
exports.uuid = uuid;
//# sourceMappingURL=index.cjs.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1631082538635);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map