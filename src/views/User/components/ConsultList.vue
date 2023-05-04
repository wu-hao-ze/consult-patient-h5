<template>
  <div class="consult-list">
    <!-- van-list组件通过loading和finished属性以及load事件来实现上拉加载更多 -->
    <!-- load事件的触发条件是滚动条与底部距离小于 offset 时触发，默认offset是300 -->
    <!-- 触发load事件会自动将loading设置为true，此时可以发起异步操作并更新数据，数据更新完毕后，将loading设置成false即可 -->
    <!-- 若数据已全部加载完毕，则直接将 finished 设置成 true 即可 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <consult-item
        v-for="item in list"
        :key="item.id"
        :item="item"
        @on-delete="onDelete"
      />
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ConsultType } from '@/enums'
import { getConsultOrderList } from '@/services/consult'
import type { ConsultOrderItem, ConsultOrderListParams } from '@/types/consult'
import { ref } from 'vue'
import ConsultItem from './ConsultItem.vue'

const props = defineProps<{ type: ConsultType }>()

// 配置发请求时的查询参数
const params = ref<ConsultOrderListParams>({
  type: props.type,
  current: 1,
  pageSize: 5
})
const loading = ref(false) // 加载状态
const finished = ref(false) // 全部加载完成
const list = ref<ConsultOrderItem[]>([]) // 问诊记录数组，也就是问诊订单详情的数组
const onLoad = async () => {
  const res = await getConsultOrderList(params.value)
  list.value.push(...res.data.rows)
  if (params.value.current >= res.data.pageTotal) {
    finished.value = true
  } else {
    params.value.current++
  }
  loading.value = false
}
// 根据consult-item子组件传来的删除订单的id(值等于该订单的orderId)来删除list中的对应订单
const onDelete = (id: string) => {
  list.value = list.value.filter((item) => item.id !== id)
}
</script>

<style lang="scss" scoped>
.consult-list {
  padding: 10px 15px;
}
</style>
