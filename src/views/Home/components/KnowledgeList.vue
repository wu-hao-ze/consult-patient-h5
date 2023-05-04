<template>
  <div class="knowledge-list">
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
      <!-- knowledge-card组件是每篇文章的结构 -->
      <knowledge-card
        v-for="item in list"
        :key="item.id"
        :item="item"
      ></knowledge-card>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import KnowledgeCard from './KnowledgeCard.vue'
import { getKnowledgePage } from '@/services/consult'
import type {
  KnowledgeList,
  KnowledgeParams,
  KnowledgeType
} from '@/types/consult'
import { ref, onMounted } from 'vue'

// 自定义属性接收的哪个板块的值
const props = defineProps<{
  type: KnowledgeType
}>()
// 文章列表数组
const list = ref<KnowledgeList>([])
// 文章列表查询参数
const params = ref<KnowledgeParams>({
  type: props.type,
  current: 1,
  pageSize: 10
})
// 实现上拉加载更多
const loading = ref(false)
const finished = ref(false)
// 接近触底时就会触发load，然后执行onLoad事件处理函数
const onLoad = async () => {
  const res = await getKnowledgePage(params.value)
  list.value.push(...res.data.rows)
  if (params.value.current >= res.data.pageTotal) {
    finished.value = true
  } else {
    params.value.current++
  }
  loading.value = false
}
// 第一次进入页面时加载一次
onMounted(() => {
  onLoad()
})
</script>

<style lang="scss" scoped>
.knowledge-list {
  padding: 0 15px;
}
</style>
