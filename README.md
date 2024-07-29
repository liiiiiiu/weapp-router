# Weapp Router

🌞 微信小程序“路由”封装

[代码片段](https://developers.weixin.qq.com/s/OJXM72ml7PTA)

> 更多微信小程序开发工具，查看 [微信小程序开发全家桶](https://www.liiiiiiu.com/dev/weapp-dev-bucket)

## 安装

```bash
npm i weapp-route
```

> 注意：在小程序中使用npm包前，需先[构建 npm](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)

## 使用

使用前需要先了解微信小程序 [路由](https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.switchTab.html) 机制

### 跳转函数

#### push

push 函数会调用 `wx.navigateTo` 或 `wx.switchTab`，函数内部会判断该页面是否为 tabBar 页面，并自动调用 `wx.navigateTo` 或 `wx.switchTab`

```javascript
import router from 'weapp-route'

page({
  navigateTo() {
    // 定义跳转页面的路径
    // 可以使用以下方式定义跳转页面的路径
    let pagePath = 'PagesLogs'               // 使用简写的方式（不包含最后一层） `/pages/logs/logs` => `PagesLogs`
    // pagePath = '/pages/logs/logs'         // 也可以写入具体的路径
    // pagePath = router.routes.PagesLogs // 或者使用 routes 对象的属性

    router.push(pagePath, {
        id: 1 // 路径携带的参数
      },
      (res) => {
        // 跳转成功的回调函数
        console.log('success callback', res)
      }, (err) => {
        // 跳转失败的回调函数
        console.log('fail callback', err)
      }, (res) => {
        // 跳转完成的回调函数
        console.log('complete callback', res)
      }
    )

    // 简写
    // router.push(pagePath)
  },

  switchTab() {
    // 与 navigateTo 一致的页面路径定义方式
    router.push('PagesIndex',
      null,
      (res) => {
        // 跳转成功的回调函数
        console.log('success callback', res)
      }, (err) => {
        // 跳转失败的回调函数
        console.log('fail callback', err)
      }, (res) => {
        // 跳转完成的回调函数
        console.log('complete callback', res)
      }
    )
  }
})
```

#### back

back 函数会调用 `wx.navigateBack`，关闭当前页面，返回上一页面或多级页面

```javascript
import router from 'weapp-route'

page({
  navigateBack() {
    router.back(
      1, // 指定返回的页面数
      (res) => {
        // 跳转成功的回调函数
        console.log('success callback', res)
      }, (err) => {
        // 跳转失败的回调函数
        console.log('fail callback', err)
      }, (res) => {
        // 跳转完成的回调函数
        console.log('complete callback', res)
      }
    )

    // 简写
    // router.back()
  }
})
```

#### replace

replace 函数会调用 `wx.redirectTo` 或 `wx.reLaunch`，默认调用 `wx.redirectTo`，在路径参数后添加 `@relaunch` 标记则调用 `wx.reLaunch`

```javascript
import router from 'weapp-route'

page({
  redirectTo() {
    // 跳转页面的路径写法与 push 函数一致
    router.replace('PagesLogs',
      null,
    (res) => {
      // 跳转成功的回调函数
      console.log('success callback', res)
    }, (err) => {
      // 跳转失败的回调函数
      console.log('fail callback', err)
    }, (res) => {
      // 跳转完成的回调函数
      console.log('complete callback', res)
    })

    // 简写
    // router.replace('/pages/logs/logs')
  },

  reLaunch() {
    router.replace(`PagesLogs@relaunch`)
  }
})
```

### 跳转路由

#### routes

获得项目中所有的路由信息，根据 app.json 中注册的页面自动生成

```javascript
import router from 'weapp-route'

page({
  onLoad() {
    foo()
  },

  foo() {
    const routes = router.routes
    console.log(routes)
    // {
    //   PagesIndex: "/pages/index/index",
    //   PagesLogs: "/pages/logs/logs",
    //   PagesMyIndex: "/pages/my/index/index",
    // }
  }
})
```

#### route

获得当前跳转页面的路由信息

```javascript
import router from 'weapp-route'

page({
  onLoad() {
    foo()
  },

  foo() {
    const route = router.route
    console.log(route)
    // {
    //   from: "pages/index/index",
    //   params: null,
    //   to: "/pages/logs/logs",
    // }
  }
})
```
