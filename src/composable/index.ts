import { onUnmounted, ref, type Ref } from 'vue'
// eslint-disable-next-line prettier/prettier
import { cancelOrder, deleteOrder, followDoctor, getPrescriptionPic } from '@/services/consult'
import type { ConsultOrderItem, FollowType } from '@/types/consult'
import { ImagePreview, Toast, type FormInstance } from 'vant'
import { OrderType } from '@/enums'
import { sendMobileCode } from '@/services/user'
import type { CodeType } from '@/types/user'

// 封装逻辑，规范命名都为useXxx，表示使用某功能

// 封装发送短信验证码逻辑
export const useSendMobileCode = (
  // 因为传过来的mobile值的类型是ref的响应式数据，所以类型是Ref<string>
  mobile: Ref<string>,
  type: CodeType = 'login' // 设置默认值是登录login
) => {
  // form表单上写ref属性，然后可以form.value就是表单组件的实例，然后调用validate方法校验手机号
  const form = ref<FormInstance>()
  const time = ref(0) // 倒计时，默认是0
  let timeId: number
  const send = async () => {
    if (time.value > 0) return // 如果正在倒计时，则退出，功能相当于禁用
    // 表单的validate方法返回promise，可以用await来区分，如果是通过则可以往下执行，如果是不通过则抛出错误，可以用catch接收
    await form.value?.validate('mobile')
    // 发送短信会返回一个带验证码的响应，只能在网络中看到，没有第三方，所以手机收不到短信
    await sendMobileCode(mobile.value, type)
    Toast.success('发送成功')
    time.value = 60
    clearInterval(timeId)
    timeId = window.setInterval(() => {
      time.value--
      if (time.value <= 0) window.clearInterval(timeId)
    }, 1000)
  }
  // 组件卸载，关闭定时器
  onUnmounted(() => {
    window.clearInterval(timeId)
  })
  return { form, time, send }
}

// 封装关注医生逻辑
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  // 类型兼容，可以用对象类型多的值，传给对象类型少的定义类型
  // {a, b} 类型，传值得时候 {a, b, c} 也可以，这是类型兼容：多的可以给少的
  const follow = async (obj: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true
    try {
      await followDoctor(obj.id, type)
      obj.likeFlag = obj.likeFlag === 1 ? 0 : 1
    } finally {
      // 不管成功和失败，最后都把loading改成false
      loading.value = false
    }
  }
  return { loading, follow }
}

// 封装查看原始处方逻辑
export const useShowPrescription = () => {
  const showPrescription = async (id?: string) => {
    if (id) {
      const res = await getPrescriptionPic(id)
      ImagePreview([res.data.url])
    }
  }
  return { showPrescription }
}

// 封装取消问诊逻辑
export const useCancelOrder = () => {
  const loading = ref(false)
  const cancelConsultOrder = (item: ConsultOrderItem) => {
    loading.value = true
    cancelOrder(item.id)
      .then(() => {
        // 修改订单状态
        item.status = OrderType.ConsultCancel
        item.statusValue = '已取消'
        Toast.success('取消成功')
      })
      .catch(() => {
        Toast.fail('取消失败')
      })
      .finally(() => {
        loading.value = false
      })
    // 上面的Promise的写法也可以改写成try，catch，finally的写法
    // try {
    // } catch (e) {
    // } finally {
    // }
  }
  // 这里导出去的loading的默认值是false
  return { loading, cancelConsultOrder }
}

// 封装删除订单逻辑
export const useDeleteOrder = (callback?: () => void) => {
  const loading = ref(false)
  const deleteConsultOrder = (item: ConsultOrderItem) => {
    loading.value = true
    deleteOrder(item.id)
      .then(() => {
        // 调用回调函数
        callback && callback()
        Toast.success('删除成功')
      })
      .catch(() => {
        Toast.fail('删除失败')
      })
      .finally(() => {
        loading.value = false
      })
  }
  // 这里导出去的loading的默认值是false
  return { loading, deleteConsultOrder }
}
