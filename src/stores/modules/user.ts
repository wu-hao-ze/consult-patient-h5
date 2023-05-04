// 导入type的写法两种都可以
import { type User } from '@/types/user'
// import type { User } from '@/types/user'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'cp-user', // 是唯一标识，也是本地存储的key值
  () => {
    // 用户信息，初始值给了一个undefined
    const user = ref<User>()
    // 设置用户信息，登录后使用
    const setUser = (u: User) => {
      user.value = u
    }
    // 删除用户信息，退出登录后使用
    const delUser = () => {
      user.value = undefined
    }
    // 地址栏中因为token失效会出现returnUrl，qq登录需要记录再跳转，其他登录方式不需要保存
    const returnUrl = ref('')
    const setReturnUrl = (url: string) => (returnUrl.value = url)

    return { user, setUser, delUser, returnUrl, setReturnUrl }
  },
  {
    // 开启持久化，使用本地存储，默认使用localStorage
    persist: true
    // 可以更改配置对象，参考文档：https://prazdevs.github.io/pinia-plugin-persistedstate/guide/
    // persist: {
    //   storage: sessionStorage
    // }
  }
)
