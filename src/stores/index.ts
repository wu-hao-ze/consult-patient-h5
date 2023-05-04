// pinia存储数据的意义：数据共享，提供给项目中任何位置使用
// 直接存储数据，刷新页面后数据就不在了，这是因为js存的东西都是在内存中，需要进行本地存储(持久化)
// 使用 pinia-plugin-persistedstate 实现pinia仓库状态持久化，且完成测试
// 安装：pnpm i pinia-plugin-persistedstate
// 然后导入一个对象，并给pinia注册为插件，注意pinia是vue的插件，pinia-plugin-persistedstate是pinia的插件
// 之后在defineStore中的第三个参数的配置选项中，加入一个persist: true的配置对象
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

// 创建pinia实例
const pinia = createPinia()
// 使用pinia插件
pinia.use(persist)
// 导出pinia实例，给main使用
export default pinia

// 统一导出：一个模块下的所有资源通过index导出，这样外部使用仓库的数据方法时，只需要引入一层目录，而无需去特意指定user还是consult
// import { useUserStore } from './modules/user'
// export { useUserStore }
// 可以直接简写为下面export xxx from '/xxx'   *的含义是所有
export * from './modules/user'
export * from './modules/consult'
