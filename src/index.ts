/**
 * 浏览器端对bridge缺省的实现
 */
const DEFAULT_BROWSER_BRIDGE_IMPL = {
  callHandler: (method, params, callback) => {
    callback();
  },
  /**
   * registerHandler
   * @param method - 方法名称
   * @param callback - 回调函数
   */
  registerHandler: (method, callback) => {},
};

/**
 * setupiOSWebViewJavascriptBridge - 设置iOS的WebViewJavascriptBridge
 * @returns {Number}
 */
function setupiOSWebViewJavascriptBridge(callback) {
  // @ts-ignore
  if (window.WebViewJavascriptBridge) {
    // @ts-ignore
    return callback(window.WebViewJavascriptBridge);
  }

  // @ts-ignore
  if (window.WVJBCallbacks) {
    // @ts-ignore
    return window.WVJBCallbacks.push(callback);
  }

  // @ts-ignore
  window.WVJBCallbacks = [callback];

  const WVJBIframe = document.createElement('iframe');

  WVJBIframe.style.display = 'none';

  WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';

  document.documentElement.appendChild(WVJBIframe);

  setTimeout(() => {
    document.documentElement.removeChild(WVJBIframe);
  }, 0);
}

/**
 * WebViewJavascriptBridge - 设置Android的WebViewJavascriptBridge
 */
function setupAndroidWebViewJavascriptBridge(callback) {
  // @ts-ignore
  if (window.WebViewJavascriptBridge) {
    // @ts-ignore
    callback(window.WebViewJavascriptBridge);
  } else {
    document.addEventListener(
      'WebViewJavascriptBridgeReady',
      () => {
        // @ts-ignore
        callback(window.WebViewJavascriptBridge);
      },
      false,
    );
  }
}

/**
 * setupWebViewJavascriptBridge
 * @param browserBridgeImpl - 客户端对bridge的实现
 */
export default (browserBridgeImpl) => {
  // @ts-ignore
  return new Promise((resolve) => {
    const platform = document.documentElement.getAttribute('platform') || 'browser';

    // @ts-ignore
    window.$platform = platform;

    // iOS端
    if (platform === 'iOS') {
      setupiOSWebViewJavascriptBridge((bridge) => {
        // @ts-ignore
        window.$bridge = bridge;

        // @ts-ignore
        resolve(window.$bridge);
      });
    }
    // Android端
    else if (platform === 'Android') {
      setupAndroidWebViewJavascriptBridge((bridge) => {
        // @ts-ignore
        window.$bridge = bridge;

        // @ts-ignore
        window.$bridge.init((message, responseCallback) => {});

        // @ts-ignore
        resolve(window.$bridge);
      });
    }
    // 浏览器端
    else if (platform === 'browser') {
      // @ts-ignore
      window.$bridge = browserBridgeImpl || DEFAULT_BROWSER_BRIDGE_IMPL;

      // @ts-ignore
      resolve(window.$bridge);
    }
  });
};
