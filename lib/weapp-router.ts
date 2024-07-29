class Router {
  protected _pages: string[]
  protected _tabbars: string[]
  protected _routes: {
    [key: string]: string
  }
  protected _route: {
    to: string
    from: string
    params: any
  } | null

  static TABBAR_TAG: string
  static RELAUNCH_TAG: string

  constructor() {
    this._pages = (__wxConfig && __wxConfig.pages) || []
    this._tabbars = (__wxConfig && __wxConfig.tabBar && __wxConfig.tabBar.list && __wxConfig.tabBar.list.length && __wxConfig.tabBar.list.map(_ => _.pagePath)) || []

    this._routes = {}
    this._route = null

    Router.TABBAR_TAG = '@tabbar'
    Router.RELAUNCH_TAG = '@relaunch'

    this.pages2Routes()
  }

  protected firstUpper(value: string): string {
    value = value + ''
    return value.length > 1 ? value[0].toUpperCase() + value.slice(1).toLowerCase() : value.toUpperCase()
  }

  protected path2Camel(value: string): string {
    value = value + ''
    return value.replace(/([^_-])(?:[_-]+([^_-]))/g, (_$0: string, $1: string, $2: string) => $1 + $2.toUpperCase()).replace(/[_-]*/g, '')
  }

  protected path2Join(path: string): string {
    if (path[0] === '/') {
      path = path.substring(1)
    }

    let arrPath = path.split('/')
    arrPath.splice(arrPath.length - 1, 1)
    arrPath = arrPath.map(_ => this.firstUpper(_))
    arrPath = arrPath.map(_ => this.path2Camel(_))

    return arrPath.join('')
  }

  protected getTag(value: unknown): string {
    if (value == null) {
      return value === undefined ? '[object Undefined]' : '[object Null]'
    }
    return Object.prototype.toString.call(value)
  }

  protected nul(value: unknown): boolean {
    return value === null
  }

  protected plainObj(value: unknown): boolean {
    return typeof value === 'object' && !this.nul(value) && this.getTag(value) === '[object Object]'
  }

  protected fun(value: unknown): boolean {
    return typeof value === 'function'
  }

  protected num(value: unknown): boolean {
    return typeof value === 'number' || (typeof value === 'object' && !this.nul(value) && this.getTag(value) === '[object Number]')
  }

  protected path2ConcatParam(path: string, params?: {
    [key: string]: any
  } | null): string {
    if (!path || !params || !this.plainObj(params)) {
      return path
    }

    // If the `path` contains these characters,
    // it is considered that the `path` has params,
    // so, return the `path` directly
    if (path.indexOf('?') > 0
      || path.indexOf('&') > 0
      || path.indexOf('=') > 0) {
      return path
    }

    let newPath: string = path + '?'

    // concat params
    Object.keys(params).forEach((key, index, keys) => {
      newPath += `${key}=${params[key]}${index !== keys.length - 1 ? '&' : ''}`
    })

    return newPath
  }

  // Check whether the current path is a tabbar page or call `wx.relaunch`
  protected path2Check(path: string): {
    newPath: string,
    isTabbar: boolean,
    isRelaunch: boolean
  } {
    path = path + ''

    // `routes` does not contain `RELAUNCH_TAG`,
    // so, after handle `isRelaunch`, remove `RELAUNCH_TAG` from `path`
    let isRelaunch: boolean = path.indexOf(Router.RELAUNCH_TAG) > -1
    if (isRelaunch) {
      path = path.replace(Router.RELAUNCH_TAG, '')
    }

    // find a matching path from the `routes` after `isRelaunch` settled
    let newPath: string = this._routes[path] || this._routes[path + Router.TABBAR_TAG] || path

    // checks if the `path` is a tabbar page
    let isTabbar: boolean = (!!this._routes[path + Router.TABBAR_TAG] || !!this._routes[this.path2Join(path) + Router.TABBAR_TAG] || path.indexOf(Router.TABBAR_TAG) > -1)

    return { newPath: newPath.replace(Router.TABBAR_TAG, ''), isTabbar, isRelaunch }
  }

  protected container4Callback(
    successCallback?: (data?: any) => any,
    failCallback?: (data?: any) => any,
    completeCallback?: (data?: any) => any
  ): {
    success: (data?: any) => any,
    fail: (data?: any) => any,
    complete: (data?: any) => any
  } {
    return {
      success: (res: any) => {
        successCallback && this.fun(successCallback) && successCallback(res)
      },
      fail: (err: any) => {
        failCallback && this.fun(failCallback) && failCallback(err)
      },
      complete: (res: any) => {
        completeCallback && this.fun(completeCallback) && completeCallback(res)
      },
    }
  }

  protected log4Route(path: string | number, params?: {
    [key: string]: any
  } | null) {
    if (!path) return

    const pages = getCurrentPages()
    const page = pages[pages.length - 1]

    this._route = {
      from: page.route,
      to: typeof path === 'number'
        ? pages[pages.length - path < 0 ? 0 : pages.length - path].route
        : path,
      params: params
    }
  }

  protected pages2Routes() {
    let tabbarRoutes: string[] = []
    if (this._tabbars.length) {
      let i = -1, l = this._tabbars.length
      while (++i < l) {
        tabbarRoutes.push(this.path2Join(this._tabbars[i]))
      }
    }

    // build routes
    if (this._pages.length) {
      let i = 0, l = this._pages.length
      for (; i < l; i++) {
        let route, page
        route = page = this._pages[i]

        route = this.path2Join(route)

        Object.assign(this._routes, {
          [route]: '/' + page
        })
        // if cur page is a tabbar page,
        // join a `TABBAR_TAG` on the key,
        // used later to know whether it is a tabbar page.
        if (tabbarRoutes.includes(route)) {
          Object.assign(this._routes, {
            [route + Router.TABBAR_TAG]: '/' + page
          })
        }
      }
    } else {
      console.warn('[wx_router] Unable to get `pages` from app.json, url is needed!')
    }
  }

  /**
   * 获得项目中所有的路由信息，根据 app.json 中注册的页面自动生成
   *
   * {
   *  PagesIndex: "/pages/index/index",
   *  PagesLogs: "/pages/logs/logs",
   *  PagesMyIndex: "/pages/my/index/index",
   * }
   */
  get routes() {
    const temp: { [key: string]: string } = {}

    Object.keys(this._routes).forEach((key: string) => {
      if (key.indexOf(Router.TABBAR_TAG) === -1) {
        temp[key] = this._routes[key]
      }
    })

    return temp
  }

  /**
   * 获得当前跳转页面的路由信息
   *
   * {
   *   from: "pages/index/index"
   *   params: null
   *   to: "/pages/logs/logs"
   * }
   */
  get route() {
    return this._route
  }

  /**
   * push 函数会调用 `wx.navigateTo` 或 `wx.switchTab`, 函数内部会判断该页面是否为 tabBar 页面，并自动调用 `wx.navigateTo` 或 `wx.switchTab`
   *
   * @param {string} path 需要跳转的页面的路径
   * @param {object} params 路径携带的参数
   * @param {Function} successCallback 跳转成功的回调函数
   * @param {Function} failCallback 跳转失败的回调函数
   * @param {Function} completeCallback 跳转完成的回调函数
   *
   * @example
   *
   * // 使用简写的方式（不包含最后一层）
   * // `/pages/logs/logs` => `PagesLogs`
   * wx_router.push('PagesLogs')
   *
   * // 也可以写入具体的路径
   * wx_router.push('/pages/logs/logs')
   *
   * // 或者使用 `routes` 对象
   * wx_router.push(wx_router.routes.PagesLogs)
   */
  public push(
    path: string,
    params?: object | null,
    successCallback?: (data?: any) => any,
    failCallback?: (data?: any) => any,
    completeCallback?: (data?: any) => any
  ) {
    if (!path) return

    const { newPath, isTabbar } = this.path2Check(path);

    this.log4Route(newPath, params);

    // @ts-ignore
    ((!isTabbar ? wx.navigateTo : wx.switchTab) as Function)({
      url: !isTabbar ? this.path2ConcatParam(newPath, params) : newPath,

      ...this.container4Callback(successCallback, failCallback, completeCallback)
    })
  }

  /**
   * replace 函数会调用 `wx.redirectTo` 或 `wx.reLaunch`，默认调用 `wx.redirectTo`，在路径参数后添加 `@relaunch` 标记则调用 `wx.reLaunch`
   *
   * @param {string} path 需要跳转的页面的路径
   * @param {object} params 路径携带的参数
   * @param {Function} successCallback 跳转成功的回调函数
   * @param {Function} failCallback 跳转失败的回调函数
   * @param {Function} completeCallback 跳转完成的回调函数
   *
   * @example
   *
   * // 使用简写的方式（不包含最后一层）
   * // `/pages/logs/logs` => `PagesLogs`
   * wx_router.replace('PagesLogs')
   *
   * // 也可以写入具体的路径
   * wx_router.replace('/pages/logs/logs')
   * 
   * // 或者使用 `routes` 对象
   * wx_router.replace(wx_router.routes.PagesLogs)
   *
   * // 添加 `@relaunch` 标签，使用 `wx.reLaunch`
   * wx_router.replace(`PagesLogs@relaunch`, null, (res: any) => {console.log(res)})
   */
  public replace(
    path: string,
    params?: object | null,
    successCallback?: (data?: any) => any,
    failCallback?: (data?: any) => any,
    completeCallback?: (data?: any) => any) {
    if (!path) return

    const { newPath, isTabbar, isRelaunch } = this.path2Check(path);

    this.log4Route(newPath, params);

    // @ts-ignore
    ((!isRelaunch ? wx.redirectTo : wx.reLaunch) as (data?: any) => any)({
      url: !isTabbar ? this.path2ConcatParam(newPath, params) : newPath,

      ...this.container4Callback(successCallback, failCallback, completeCallback)
    })
  }

  /**
   * back 函数会调用 `wx.navigateBack`，关闭当前页面，返回上一页面或多级页面
   *
   * @param {number} delta 指定返回的页面数
   * @param {Function} successCallback 跳转成功的回调函数
   * @param {Function} failCallback 跳转失败的回调函数
   * @param {Function} completeCallback 跳转完成的回调函数
   *
   * @example
   *
   * wx_router.back()
   *
   * wx_router.back(2, () => (res: any) => {console.log(res)})
   */
  public back(
    delta?: number,
    successCallback?: (data?: any) => any,
    failCallback?: (data?: any) => any,
    completeCallback?: (data?: any) => any
  ) {
    if (!this.num(delta) || (delta && delta < 1)) {
      delta = 1
    }

    this.log4Route(delta || 1, null);

    wx.navigateBack({
      delta,

      ...(this.container4Callback(successCallback, failCallback, completeCallback) as any)
    })
  }
}

/**
 * 🌞 微信小程序“路由”封装
 *
 * 封装 `wx.switchTab` `wx.reLaunch` `wx.redirectTo` `wx.navigateTo` `wx.navigateBack`，一致的语法结构
 */
const router: Router = new Router()

export default router