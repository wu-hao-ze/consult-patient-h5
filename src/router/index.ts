import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
// 导入进度条插件
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 插件配置，关闭加载过程的小圆圈
NProgress.configure({
  showSpinner: false
})

// vue2中的路由
// import VueRouter from 'vue-router'
// const router = new VueRouter({ router: [路由规则] })
// 路由模式有hash模式，history模式

// vue3中的路由
// import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
// 通过createRouter来创建路由实例对象，里面放配置选项
// createWebHistory() 是开启history模式   http://xxx/user
// createWebHashHistory 是开启hash模式    http://xxx/#/user
// import.meta.env.BASE_URL是路由的基准地址，默认是'/'，类似于axios的baseURL给请求的接口前加一个固定路径，这里是给路由前加固定路径
// import.meta.env.BASE_URL的值来自vite.config.ts的 base 属性的值
// 这是由create-vue脚手架提供的数据(环境变量)，在vite.config.js中设置，可以添加配置base: my-path，那么路由就会加上 my-path 前缀
// 比如之前是：http://xxx/user 现在是：http://xxx/my-path/user
// 一个服务器(同一个域名)放置多个项目，那么就需要加上这个项目的路由前缀，就要设置base的值
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/Login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: () => import('@/views/Layout/index.vue'),
      redirect: '/home',
      children: [
        {
          path: '/home',
          component: () => import('@/views/Home/index.vue'),
          meta: { title: '首页' }
        },
        {
          path: '/article',
          component: () => import('@/views/Article/index.vue'),
          meta: { title: '健康百科' }
        },
        {
          path: '/notify',
          component: () => import('@/views/Notify/index.vue'),
          meta: { title: '消息通知' }
        },
        {
          path: '/user',
          component: () => import('@/views/User/index.vue'),
          meta: { title: '个人中心' }
        }
      ]
    },
    {
      path: '/user/patient',
      component: () => import('@/views/User/PatientPage.vue'),
      meta: { title: '家庭档案' }
    },
    {
      path: '/consult/fast',
      component: () => import('@/views/Consult/ConsultFast.vue'),
      meta: { title: '极速问诊' }
    },
    {
      path: '/consult/dep',
      component: () => import('@/views/Consult/ConsultDep.vue'),
      meta: { title: '选择科室' }
    },
    {
      path: '/consult/illness',
      component: () => import('@/views/Consult/ConsultIllness.vue'),
      meta: { title: '病情描述' }
    },
    {
      path: '/consult/pay',
      component: () => import('@/views/Consult/ConsultPay.vue'),
      meta: { title: '问诊支付' }
    },
    {
      path: '/room',
      component: () => import('@/views/Room/index.vue'),
      meta: { title: '问诊室' },
      // beforeEnter守卫，只在进入路由时触发，不会在 params、query 或 hash 改变时触发
      // 如果进入问诊室的时候payResult是false，也就是支付失败，则拦截去问诊记录
      beforeEnter(to) {
        if (to.query.payResult === 'false') return '/user/consult'
      }
    },
    {
      path: '/user/consult',
      component: () => import('@/views/User/ConsultPage.vue'),
      meta: { title: '问诊记录' }
    },
    {
      path: '/user/consult/:id',
      component: () => import('@/views/User/ConsultDetail.vue'),
      meta: { title: '问诊详情' }
    },
    {
      path: '/order/pay',
      component: () => import('@/views/Order/OrderPay.vue'),
      meta: { title: '药品支付' }
    },
    {
      path: '/order/pay/result',
      component: () => import('@/views/Order/OrderPayResult.vue'),
      meta: { title: '药品支付结果' }
    },
    {
      path: '/order/:id?',
      component: () => import('@/views/Order/OrderDetail.vue'),
      meta: { title: '药品订单详情' }
    },
    {
      path: '/order/logistics/:id',
      component: () => import('@/views/Order/OrderLogistics.vue'),
      meta: { title: '物流详情' }
    },
    {
      path: '/login/callback',
      component: () => import('@/views/Login/LoginCallback.vue'),
      meta: { title: 'QQ登录-绑定手机' }
    }
  ]
})

// 前置守卫，对访问权限进行控制
// vue3中两个参数，第一个参数是to，第二个参数是from，可以不用next函数
// 不返回，或者return true就是放行
// 返回指定地址就会拦截去对应地址
router.beforeEach(async (to) => {
  // 切换路由前开启进度条
  NProgress.start()
  // 用户仓库
  const store = useUserStore()
  // 不需要登录的页面，白名单
  const whiteList = ['/login', '/login/callback']
  // 如果没有token且不在白名单内，去登录
  if (!store.user?.token && !whiteList.includes(to.path)) return '/login'
  // 否则不做任何处理，就是放行
})

// 后置守卫
// 在路由规则中给每一个路由添加 元信息 数据meta，记录路由信息，这里主要是使用title
// 修改标题放到后置守卫中，切换路由完成后自动修改标题
router.afterEach((to) => {
  // 通过document.title来设置标题
  document.title = `优医问诊-${to.meta.title || ''}`
  // 切换路由完成后关闭
  NProgress.done()
})

export default router
