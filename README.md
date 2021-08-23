# WebViewJavascriptBridge

和iOS和Android进行桥接通信的JavaScript实现

---

# 安装


```js
  npm install @ctsj/webviewjavascriptbridge
```

# 使用
index.html
```html
<!DOCTYPE html>
<!-- platform的值可以为 Android | iOS | browser | '' 默认是browser -->
<html lang="en" platform="iOS">
  <head>
    <meta charset="UTF-8" />
    <title></title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

index.js
```js
import WebViewJavascriptBridge from '@ctsj/webviewjavascriptbridge';

/**
 * WebViewJavascriptBridge
 * 调用此方法返回相应平台的bridge对象
 */ 
WebViewJavascriptBridge().then((bridge) => {
 // 也可以通过window.$bridge来获取桥接对象
    
 // 也可以通过window.$platform来获取平台信息
});
```

建议把clientToNative的方法和navtieToClient的方法分别放在不同的2个文件中集中进行管理

例如使用clientObj.js封装所有clientCallNative的方法
```js
export default {
  printLog: function () {
    if (window.$platform === "browser") {
      console.log.apply(console, arguments);
      return;
    }

    window.$bridge.callHandler("printLog", logData);
  },
  refurbishToken: function (token) {
    return new Promise((resolve) => {
      window.$bridge.callHandler(
        "refurbishToken",
        token,
        function (responseData) {
          try {
            if (typeof responseData === "string") {
              responseData = JSON.parse(responseData);
            }
          } catch (e) {}

          resolve(responseData);
        }
      );
    });
  },
  getLocation: function () {
    return new Promise((resolve) => {
      window.$bridge.callHandler(
        "testObjcCallback",
        { foo: "bar" },
        function (responseData) {
          try {
            if (typeof responseData === "string") {
              responseData = JSON.parse(responseData);
            }
          } catch (e) {}
          resolve(responseData);
        }
      );
    });
  },
}
```

例如使用clientRegisterObj.js封装所有natoveCallNative的方法
```js
export default {
    /**
   * setParameters - 设置参数信息
   * @param callback
   */
  setParameters: function (callback) {
    // 第一次显示loading
    const indicator = globalindicator.show();

    // 注册了这个方法
    window.$bridge.registerHandler(
      "setParameters",
      (parameters, responseCallback) => {
        window.$pictureClientObj.printLog("setParametersCall");
        indicator && globalindicator.hide(indicator);

        try {
          if (typeof parameters === "string") {
            parameters = JSON.parse(parameters);
          }
        } catch (e) {}

        callback({
          parameters,
          responseCallback,
        });
      }
    );
  },
  /**
   * setLocation - 手机端获取经纬度信息
   *   cityName:
   *   cityCode:
   *   lon:
   *   lat:
   * }
   * @param callback
   */
  setLocation: function (callback) {
    // 第一次显示loading
    const indicator = globalindicator.show(document.body, "位置获取中...");

    // 注册了这个方法
    window.$bridge.registerHandler("setLocation", (data, responseCallback) => {
      // 这个方法可能会被手机端多次调用

      try {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
      } catch (e) {}

      window.$pictureClientObj.printLog("setLocationCallSuccess", data);

      indicator && globalindicator.hide(indicator);

      // 需要向用户展示位置已经切换成功了
      MessageDialog.makeText({
        parent: document.body,
        text: "位置切换成功",
        position: "center",
        duration: "short",
      });

      callback({
        data,
        responseCallback,
      });
    });
  },
};
```

当platform设置成browser的时候需要使用者自行实现bridge，例如
```js
WebViewJavascriptBridge({
  /**
   * registerHandler
   * @param method - 方法名称
   * @param params - 参数
   * @param callback - 回调函数
   */
  callHandler: (method, params, callback) => {
    callback();
  },
  /**
   * registerHandler
   * @param method - 方法名称
   * @param callback - 回调函数
   */
  registerHandler: (method, callback) => {},
}).then((bridge) => {
 // 也可以通过window.$bridge来获取桥接对象
    
 // 也可以通过window.$platform来获取平台信息
});
```
