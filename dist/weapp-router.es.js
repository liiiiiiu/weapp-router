class Router {
  constructor() {
    this._pages = __wxConfig && __wxConfig.pages || [];
    this._tabbars = __wxConfig && __wxConfig.tabBar && __wxConfig.tabBar.list && __wxConfig.tabBar.list.length && __wxConfig.tabBar.list.map((_) => _.pagePath) || [];
    this._routes = {};
    this._route = null;
    Router.TABBAR_TAG = "@tabbar";
    Router.RELAUNCH_TAG = "@relaunch";
    this.pages2Routes();
  }
  firstUpper(value) {
    value = value + "";
    return value.length > 1 ? value[0].toUpperCase() + value.slice(1).toLowerCase() : value.toUpperCase();
  }
  path2Camel(value) {
    value = value + "";
    return value.replace(/([^_-])(?:[_-]+([^_-]))/g, (_$0, $1, $2) => $1 + $2.toUpperCase()).replace(/[_-]*/g, "");
  }
  path2Join(path) {
    if (path[0] === "/") {
      path = path.substring(1);
    }
    let arrPath = path.split("/");
    arrPath.splice(arrPath.length - 1, 1);
    arrPath = arrPath.map((_) => this.firstUpper(_));
    arrPath = arrPath.map((_) => this.path2Camel(_));
    return arrPath.join("");
  }
  getTag(value) {
    if (value == null) {
      return value === void 0 ? "[object Undefined]" : "[object Null]";
    }
    return Object.prototype.toString.call(value);
  }
  nul(value) {
    return value === null;
  }
  plainObj(value) {
    return typeof value === "object" && !this.nul(value) && this.getTag(value) === "[object Object]";
  }
  fun(value) {
    return typeof value === "function";
  }
  num(value) {
    return typeof value === "number" || typeof value === "object" && !this.nul(value) && this.getTag(value) === "[object Number]";
  }
  path2ConcatParam(path, params) {
    if (!path || !params || !this.plainObj(params)) {
      return path;
    }
    if (path.indexOf("?") > 0 || path.indexOf("&") > 0 || path.indexOf("=") > 0) {
      return path;
    }
    let newPath = path + "?";
    Object.keys(params).forEach((key, index, keys) => {
      newPath += `${key}=${params[key]}${index !== keys.length - 1 ? "&" : ""}`;
    });
    return newPath;
  }
  path2Check(path) {
    path = path + "";
    let isRelaunch = path.indexOf(Router.RELAUNCH_TAG) > -1;
    if (isRelaunch) {
      path = path.replace(Router.RELAUNCH_TAG, "");
    }
    let newPath = this._routes[path] || this._routes[path + Router.TABBAR_TAG] || path;
    let isTabbar = !!this._routes[path + Router.TABBAR_TAG] || !!this._routes[this.path2Join(path) + Router.TABBAR_TAG] || path.indexOf(Router.TABBAR_TAG) > -1;
    return { newPath: newPath.replace(Router.TABBAR_TAG, ""), isTabbar, isRelaunch };
  }
  container4Callback(successCallback, failCallback, completeCallback) {
    return {
      success: (res) => {
        successCallback && this.fun(successCallback) && successCallback(res);
      },
      fail: (err) => {
        failCallback && this.fun(failCallback) && failCallback(err);
      },
      complete: (res) => {
        completeCallback && this.fun(completeCallback) && completeCallback(res);
      }
    };
  }
  log4Route(path, params) {
    if (!path)
      return;
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    this._route = {
      from: page.route,
      to: typeof path === "number" ? pages[pages.length - path < 0 ? 0 : pages.length - path].route : path,
      params
    };
  }
  pages2Routes() {
    let tabbarRoutes = [];
    if (this._tabbars.length) {
      let i = -1, l = this._tabbars.length;
      while (++i < l) {
        tabbarRoutes.push(this.path2Join(this._tabbars[i]));
      }
    }
    if (this._pages.length) {
      let i = 0, l = this._pages.length;
      for (; i < l; i++) {
        let route, page;
        route = page = this._pages[i];
        route = this.path2Join(route);
        Object.assign(this._routes, {
          [route]: "/" + page
        });
        if (tabbarRoutes.includes(route)) {
          Object.assign(this._routes, {
            [route + Router.TABBAR_TAG]: "/" + page
          });
        }
      }
    } else {
      console.warn("[wx_router] Unable to get `pages` from app.json, url is needed!");
    }
  }
  get routes() {
    const temp = {};
    Object.keys(this._routes).forEach((key) => {
      if (key.indexOf(Router.TABBAR_TAG) === -1) {
        temp[key] = this._routes[key];
      }
    });
    return temp;
  }
  get route() {
    return this._route;
  }
  push(path, params, successCallback, failCallback, completeCallback) {
    if (!path)
      return;
    const { newPath, isTabbar } = this.path2Check(path);
    this.log4Route(newPath, params);
    (!isTabbar ? wx.navigateTo : wx.switchTab)({
      url: !isTabbar ? this.path2ConcatParam(newPath, params) : newPath,
      ...this.container4Callback(successCallback, failCallback, completeCallback)
    });
  }
  replace(path, params, successCallback, failCallback, completeCallback) {
    if (!path)
      return;
    const { newPath, isTabbar, isRelaunch } = this.path2Check(path);
    this.log4Route(newPath, params);
    (!isRelaunch ? wx.redirectTo : wx.reLaunch)({
      url: !isTabbar ? this.path2ConcatParam(newPath, params) : newPath,
      ...this.container4Callback(successCallback, failCallback, completeCallback)
    });
  }
  back(delta, successCallback, failCallback, completeCallback) {
    if (!this.num(delta) || delta && delta < 1) {
      delta = 1;
    }
    this.log4Route(delta || 1, null);
    wx.navigateBack({
      delta,
      ...this.container4Callback(successCallback, failCallback, completeCallback)
    });
  }
}
const router = new Router();
export { router as default };
