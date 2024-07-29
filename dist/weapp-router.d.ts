declare class Router {
    protected _pages: string[];
    protected _tabbars: string[];
    protected _routes: {
        [key: string]: string;
    };
    protected _route: {
        to: string;
        from: string;
        params: any;
    } | null;
    static TABBAR_TAG: string;
    static RELAUNCH_TAG: string;
    constructor();
    protected firstUpper(value: string): string;
    protected path2Camel(value: string): string;
    protected path2Join(path: string): string;
    protected getTag(value: unknown): string;
    protected nul(value: unknown): boolean;
    protected plainObj(value: unknown): boolean;
    protected fun(value: unknown): boolean;
    protected num(value: unknown): boolean;
    protected path2ConcatParam(path: string, params?: {
        [key: string]: any;
    } | null): string;
    protected path2Check(path: string): {
        newPath: string;
        isTabbar: boolean;
        isRelaunch: boolean;
    };
    protected container4Callback(successCallback?: (data?: any) => any, failCallback?: (data?: any) => any, completeCallback?: (data?: any) => any): {
        success: (data?: any) => any;
        fail: (data?: any) => any;
        complete: (data?: any) => any;
    };
    protected log4Route(path: string | number, params?: {
        [key: string]: any;
    } | null): void;
    protected pages2Routes(): void;
    /**
     * 获得项目中所有的路由信息，根据 app.json 中注册的页面自动生成
     *
     * {
     *  PagesIndex: "/pages/index/index",
     *  PagesLogs: "/pages/logs/logs",
     *  PagesMyIndex: "/pages/my/index/index",
     * }
     */
    get routes(): {
        [key: string]: string;
    };
    /**
     * 获得当前跳转页面的路由信息
     *
     * {
     *   from: "pages/index/index"
     *   params: null
     *   to: "/pages/logs/logs"
     * }
     */
    get route(): {
        to: string;
        from: string;
        params: any;
    } | null;
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
    push(path: string, params?: object | null, successCallback?: (data?: any) => any, failCallback?: (data?: any) => any, completeCallback?: (data?: any) => any): void;
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
    replace(path: string, params?: object | null, successCallback?: (data?: any) => any, failCallback?: (data?: any) => any, completeCallback?: (data?: any) => any): void;
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
    back(delta?: number, successCallback?: (data?: any) => any, failCallback?: (data?: any) => any, completeCallback?: (data?: any) => any): void;
}
/**
 * 🌞 微信小程序“路由”封装
 *
 * 封装 `wx.switchTab` `wx.reLaunch` `wx.redirectTo` `wx.navigateTo` `wx.navigateBack`，一致的语法结构
 */
declare const router: Router;
export default router;
