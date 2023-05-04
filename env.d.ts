/// <reference types="vite/client" />
interface Window {
  _AMapSecurityConfig: {
    securityJsCode: string
  }
  QC: {
    Login: {
      // 检查是否qq登录成功
      check(): boolean
      // 拿到个人信息，回调函数的形参就是openId
      getMe(cb: (openId: string) => void): void // getMe函数的形参cb类型是一个函数，而这个函数的形参就是openId
    }
  }
}
