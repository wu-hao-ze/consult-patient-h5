// 实现：token请求头携带，错误响应处理，401错误处理
import { useUserStore } from '@/stores'
import router from '@/router'
// import axios from 'axios'
// import type { Method } from 'axios'
// 上面两行可以合并成
import axios, { type Method } from 'axios'
import { Toast } from 'vant'

// 1.axios的配置，基准地址，响应超时时间
const baseURL = 'https://consult-api.itheima.net/'
const instance = axios.create({
  baseURL,
  timeout: 10000
})

// 2.请求拦截器，携带token
instance.interceptors.request.use(
  (config) => {
    // store放到里面是因为pinia可能比request模块加载晚，那么store就空了，放到发请求里一定是可以得到用户信息的
    const store = useUserStore()
    // 注意下面的config.headers可能为空，但是还要进行赋值操作，所以不能用非空断言!也不能用可选链操作符?
    // 那么只能用类型守卫(js逻辑判断)，在前面加上&&config.headers
    if (store.user?.token && config.headers) {
      config.headers['Authorization'] = `Bearer ${store.user?.token}` // config.headers.Authorization也是可以的
    }
    // 按需走mock
    // 如果在mock列表中去除baseURL，走本地开发服务进去mock接口，开发环境不需要该操作
    // if (mockList.find((item) => item.url === config.url)) {
    //   config.baseURL = ''
    // }
    return config
  },
  (err) => Promise.reject(err)
)

// 3.响应拦截器，判断业务是否成功(status状态码是200，但是code不符合标准)，剥离无效数据(去掉axios的包装)，token失效的401拦截去登录
// 将来axios.get().then(res，这里的res就是返回的res.data).catch(error，这里的error有两种情况)
// 一种是响应成功，但是code不是10000，返回的res.data，一种是status不是200，响应不成功，返回的错误对象
instance.interceptors.response.use(
  // 接口约定：如果res.status是200就代表响应成功会进入到res这里，如果不成功则进入下面err里
  (res) => {
    // 如果res.data.code是10000代表业务成功，如果不是10000，使用Toast轻提示来表示业务失败，报错阻断程序
    if (res.data?.code !== 10000) {
      Toast(res.data?.message)
      return Promise.reject(res.data) // 这里返回res.data是因为可能后续使用到code再做区分
    }
    // 业务逻辑成功，剥离无效数据
    return res.data
  },
  (err) => {
    // token失效，status为401的情况
    if (err.response.status === 401) {
      // 删除用户信息
      const store = useUserStore()
      store.delUser()
      // 跳转登录，带上接口失效所在页面的地址，用于登录完成后回跳使用，之前是直接登录到首页，这里是为了用户更好的体验
      // router.currentRoute可以拿到当前路由信息，因为是ref创建的数据，所以要再value
      // router.currentRoute.value.fullPath可以拿到当前页面的完整路径
      // 对于/user/patient?id=100       path是/user/patient         fullPath是/user/patient?id=100
      // fullPath包含path，query，hash
      router.push(`/login?returnUrl=${router.currentRoute.value.fullPath}`)
    }
    return Promise.reject(err)
  }
)

// 4.封装请求工具函数
// 定义接口返回的真实数据的类型
type Data<T> = {
  success: boolean
  code: number
  message: string
  data: T
}
// <T>的作用是导入T，然后可以在形参类型或者是函数返回值类型中使用
// 这里T的值是将来调用request函数时传来的类型，目的是用在下面传给Data<T>，注意这里跟形参和函数返回值没关系
const request = <T>(
  url: string,
  method: Method = 'get', // 默认值是get，如果是get就可以不写
  submitData?: object
) => {
  // 这里ctrl+鼠标左键可以点进request查看内部定义的类型声明，可以发现第一个参数的类型是放到第二个参数里
  // 再点进第二个AxiosResponse里，可以发现axios包装的数据有6个参数，而传来的T最终是放在了data下
  // 但是我们要去掉包装的类型声明，让以后的res的类型直接就是真实类型
  // 上面对数据的处理已经去掉包装了，返回值res确实就已经是真实数据了，但是类型还没改变，这里是为了改变类型，达到统一
  // 那么我们可以直接改变第二个参数R的类型，参数R的类型会直接影响到函数返回值Promise<R>的类型，这样返回值res类型就是Data<T>
  // 而不再使用axios内部封装的AxiosResponse<T>的类型
  return instance.request<T, Data<T>>({
    url,
    method,
    // 前面对象中有提到，如果要用变量名作为属性名，则要把变量名用[]括起来
    // 这里是一个三元表达式，可以理解为也是一个变量，所以要用[]括起来
    [method.toLowerCase() === 'get' ? 'params' : 'data']: submitData
  })
}

// 将来的调用如下：
// request<User>('/user', 'get').then((res) => {
//   res.data.avatar
// })

export { baseURL, instance, request }
