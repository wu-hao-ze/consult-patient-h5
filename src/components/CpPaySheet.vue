<template>
  <!-- 底部支付方式弹窗 -->
  <!-- closeable是弹层的右上方的关闭按钮，close-on-popstate如果是true，则回退时自动关闭 -->
  <!-- before-close是关闭前的回调函数，返回false可阻止关闭，可返回promise -->
  <!-- 这里注意一点，consult-pay中的cp-pay-sheet组件可以使用v-model，而这里van-action-sheet不能使用v-model -->
  <!-- 这里的:show和@update:show是绑定在vant组件中的，不能用v-model是因为@update:show后面的事件处理函数不是show=$event -->
  <!-- 而是把vant组件内部返回的$event(也就是更改的show值)通过emit再传给consult-pay -->
  <!-- emit中的'update:show'是consult-pay中的cp-pay-sheet组件的默认自定义事件，而$event是vant组件中的修改的show值 -->
  <!-- 也就是说下面的两个update:show不是同一个 -->
  <van-action-sheet
    :show="show"
    @update:show="emit('update:show', $event)"
    title="选择支付方式"
    :close-on-popstate="false"
    :before-close="onClose"
    :closeable="false"
  >
    <div class="pay-type">
      <p class="amount">￥{{ actualPayment.toFixed(2) }}</p>
      <van-cell-group>
        <van-cell title="微信支付" @click="paymentMethod = 0">
          <!-- 使用插槽自定义图标 -->
          <template #icon><cp-icon name="consult-wechat" /></template>
          <template #extra
            ><van-checkbox :checked="paymentMethod === 0"
          /></template>
        </van-cell>
        <van-cell title="支付宝支付" @click="paymentMethod = 1">
          <template #icon><cp-icon name="consult-alipay" /></template>
          <template #extra
            ><van-checkbox :checked="paymentMethod === 1"
          /></template>
        </van-cell>
      </van-cell-group>
      <div class="btn">
        <van-button @click="pay" type="primary" round block
          >立即支付</van-button
        >
      </div>
    </div>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { Toast } from 'vant'
import { ref } from 'vue'
import { getConsultOrderPayUrl } from '@/services/consult'

// 接收三个数据，订单id，是否展示本组件，付款成功后的回调地址
// actualPayment用于在上面结构的渲染，onClose是可选参数，用在组件的before-close中
const props = defineProps<{
  orderId: string
  actualPayment: number
  onClose?: () => void
  show: boolean
  payCallback: string
}>()
// 这个emit是用于传给父组件consult-pay的，而不是和van-action-sheet产生关系
const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
}>()

// 支付方式，0代表微信，1代表支付宝
const paymentMethod = ref<0 | 1>()

// 跳转支付
const pay = async () => {
  if (paymentMethod.value === undefined) return Toast('请选择支付方式')
  Toast.loading('跳转支付')
  const res = await getConsultOrderPayUrl({
    orderId: props.orderId,
    paymentMethod: paymentMethod.value,
    payCallback: import.meta.env.VITE_APP_CALLBACK + props.payCallback
  })
  window.location.href = res.data.payUrl // 直接跳转到后端返回的支付平台的网址
}
</script>

<style lang="scss" scoped>
.pay-type {
  .amount {
    padding: 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
  .btn {
    padding: 15px;
  }
  .van-cell {
    align-items: center;
    .cp-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .van-checkbox :deep(.van-checkbox__icon) {
      font-size: 16px;
    }
  }
}
</style>
