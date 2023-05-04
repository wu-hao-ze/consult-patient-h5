// 导入组件实例
import CpNavBar from '@/components/CpNavBar.vue'
import CpIcon from '@/components/CpIcon.vue'
import CpRadioBtn from '@/components/CpRadioBtn.vue'
import CpPaySheet from '@/components/CpPaySheet.vue'
import { RouterLink, RouterView } from 'vue-router'

// 1.声明 vue 类型模块
declare module 'vue' {
  // 2.给vue添加(扩展)全局组件类型，interface可以和之前的合并
  interface GlobalComponents {
    // 3.定义具体组件类型，属性名为组件名称(支持大驼峰)，属性值是组件类型
    // typeof可以从一个js对象中得到它的类型，所以此时typeof的作用是获取到组件实例类型
    CpNavBar: typeof CpNavBar
    CpIcon: typeof CpIcon
    CpRadioBtn: typeof CpRadioBtn
    CpPaySheet: typeof CpPaySheet
    RouterLink: typeof RouterLink
    RouterView: typeof RouterView
  }
}
