import { getMedicalOrderDetail } from '@/services/order'
import type { OrderDetail } from '@/types/order'
import { onMounted, ref } from 'vue'

// 封装根据药品订单id获取药品订单详情逻辑
export const useOrderDetail = (id: string) => {
  const loading = ref(false)
  const order = ref<OrderDetail>()
  onMounted(async () => {
    loading.value = true
    try {
      const res = await getMedicalOrderDetail(id)
      order.value = res.data
    } finally {
      loading.value = false
    }
  })
  return { order, loading }
}
