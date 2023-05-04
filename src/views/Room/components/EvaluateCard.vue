<template>
  <!-- 已评价之后的展示 -->
  <div class="evalutate-card" v-if="evaluateDoc">
    <p class="title">医生服务评价</p>
    <p class="desc">我们会更加努力提升服务质量</p>
    <van-rate
      :modelValue="evaluateDoc.score"
      size="7vw"
      gutter="3vw"
      color="#FADB14"
      void-icon="star"
      void-color="rgba(0,0,0,0.04)"
    />
  </div>
  <!-- 未评价请做出评价 -->
  <div class="evalutate-card" v-else>
    <p class="title">感谢您的评价</p>
    <p class="desc">本次在线问诊服务您还满意吗？</p>
    <!-- 评分：星星数 -->
    <van-rate
      v-model="score"
      size="7vw"
      gutter="3vw"
      color="#FADB14"
      void-icon="star"
      void-color="rgba(0,0,0,0.04)"
    />
    <!-- 评价内容 -->
    <van-field
      v-model="content"
      type="textarea"
      maxlength="150"
      show-word-limit
      rows="3"
      placeholder="请描述您对医生的评价或是在医生看诊过程中遇到的问题"
    ></van-field>
    <!-- 底部的是否匿名评价以及提交 -->
    <div class="footer">
      <van-checkbox v-model="anonymousFlag">匿名评价</van-checkbox>
      <van-button
        @click="onSubmit"
        type="primary"
        size="small"
        :class="{ disabled }"
        round
      >
        提交评价
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { evaluateConsultOrder } from '@/services/consult'
import type { ConsultOrderItem } from '@/types/consult'
import type { EvaluateDoc } from '@/types/room'
import { Toast } from 'vant'
import { computed, inject, ref, type Ref } from 'vue'

defineProps<{
  evaluateDoc?: EvaluateDoc
}>()
// 通过inject来接收index.vue中provide的数据，数据也可以是函数，可以传函数，接收函数
// 注意，谁提供的数据谁来修改，也就是说inject的组件里不能修改接收的数据，只能在provide的组件里修改数据
const consult = inject<Ref<ConsultOrderItem>>('consult')
const completeEva = inject<(score: number) => void>('completeEva')

const score = ref(0) // 评分
const anonymousFlag = ref(false) // 是否匿名
const content = ref('') // 评价内容
const disabled = computed(() => !score.value || !content.value) // 如果评分或者内容没有值，则disabled为true
// 提交评价
const onSubmit = async () => {
  if (!score.value) return Toast('请选择评分')
  if (!content.value) return Toast('请输入评价')
  if (!consult?.value) return Toast('未找到订单')
  if (consult.value.docInfo?.id) {
    await evaluateConsultOrder({
      docId: consult.value.docInfo?.id, // 医生id
      orderId: consult.value.id, // 订单详情中的问诊订单id
      score: score.value,
      content: content.value,
      anonymousFlag: anonymousFlag.value ? 1 : 0
    })
  }
  // 完成评价后，调用index.vue中传来的函数，把未评价修改成已评价，并且将评分(星星数)传入评价内容中
  completeEva && completeEva(score.value)
}
</script>

<style lang="scss" scoped>
.evalutate-card {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  padding: 15px;
  .title {
    font-size: 15px;
    margin-bottom: 5px;
  }
  .desc {
    font-size: 12px;
    margin-bottom: 15px;
    color: var(--cp-tip);
  }
  .van-field {
    background-color: var(--cp-bg);
    margin: 15px 0;
    border-radius: 8px;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    ::v-deep() {
      .van-checkbox {
        .van-icon {
          font-size: 12px;
        }
        &__label {
          font-size: 12px;
          color: var(--cp-tip);
        }
        height: 16px;
      }
      .van-button {
        padding: 0 16px;
        &.disabled {
          opacity: 1;
          background: #fafafa;
          color: #d9dbde;
          border: #fafafa;
        }
      }
    }
  }
}
</style>
