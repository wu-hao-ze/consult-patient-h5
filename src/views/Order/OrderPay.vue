<template>
  <div class="order-pay-page" v-if="orderPre && address">
    <cp-nav-bar title="药品支付" />
    <div class="order-address">
      <p class="area">
        <van-icon name="location" />
        <span>{{ address.province + address.city + address.county }}</span>
      </p>
      <p class="detail">{{ address.addressDetail }}</p>
      <p>
        {{ address.receiver }}
        <!-- 进行手机号脱敏处理，?:代表这个分组不会被匹配，所以后面的$2指的是最后一个分组(\d{4}) -->
        {{ address.mobile.replace(/^(\d{3})(?:\d{4})(\d{4})$/, '$1****$2') }}
      </p>
    </div>
    <!-- 渲染每一件药品的信息 -->
    <order-medical :medicines="orderPre.medicines" />
    <div class="order-detail">
      <van-cell-group>
        <van-cell title="药品金额" :value="`￥${orderPre.payment}`" />
        <van-cell title="运费" :value="`￥${orderPre.expressFee}`" />
        <van-cell title="优惠券" :value="`-￥${orderPre.couponDeduction}`" />
        <van-cell
          title="实付款"
          :value="`￥${orderPre.actualPayment}`"
          class="price"
        />
      </van-cell-group>
    </div>
    <div class="order-tip">
      <p class="tip">
        由于药品的特殊性，如非错发、漏发药品的情况，药品一经发出
        不得退换，请核对药品信息无误后下单。
      </p>
      <van-checkbox v-model="agree"
        >我已同意<a href="javascript:;">支付协议</a></van-checkbox
      >
    </div>
    <van-submit-bar
      :price="orderPre.actualPayment * 100"
      button-text="立即支付"
      button-type="primary"
      @submit="submit"
      :loading="loading"
      text-align="left"
    ></van-submit-bar>
    <!-- 回跳地址为支付成功后的显示页面 -->
    <cp-pay-sheet
      :orderId="orderId"
      :actualPayment="orderPre.actualPayment"
      v-model:show="show"
      payCallback="/order/pay/result"
    />
  </div>
  <div class="order-pay-page" v-else>
    <cp-nav-bar title="药品支付" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
  </div>
</template>

<script setup lang="ts">
import {
  createMedicalOrder,
  getAddressList,
  getMedicalOrderPre
} from '@/services/order'
import type { AddressItem, OrderPre } from '@/types/order'
import { Toast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import OrderMedical from './components/OrderMedical.vue'

const route = useRoute()
const orderPre = ref<OrderPre>() // 药品订单预支付信息
const address = ref<AddressItem>() // 收货地址
onMounted(async () => {
  // 获取药品订单预支付信息
  const res = await getMedicalOrderPre({
    prescriptionId: route.query.id as string // 在药品支付页面中地址栏上有查询参数，就是处方id
  })
  orderPre.value = res.data
  // 获取收货地址列表，如果有默认地址则使用默认的，如果没有则使用列表中第一个数据
  const addRes = await getAddressList()
  if (addRes.data.length) {
    const defAddress = addRes.data.find((item) => item.isDefault === 0)
    if (defAddress) address.value = defAddress
    else address.value = addRes.data[0]
  }
})

const show = ref(false) // 底部弹出支付方式的显示与隐藏

const agree = ref(false) // 复选框的勾选和取消
const loading = ref(false) // 点击立即支付之后的加载状态
const orderId = ref('') // 药品订单id

// 点击立即支付之后，会根据处方id，收货地址以及优惠券(这里没有)生成药品订单，然后底部弹出进入支付方式的选择
const submit = async () => {
  if (!agree.value) return Toast('请同意支付协议')
  if (!address.value?.id) return Toast('请选择收货地址')
  if (!orderPre.value?.id) return Toast('未找到处方')
  // 如果没有药品订单id
  if (!orderId.value) {
    loading.value = true
    try {
      const res = await createMedicalOrder({
        id: orderPre.value?.id,
        addressId: address.value?.id,
        couponId: orderPre.value.couponId
      })
      orderId.value = res.data.id // 赋值药品订单id
      show.value = true // 底部弹出支付方式的选择
    } finally {
      loading.value = false
    }
  }
  // 如果有药品订单id
  else {
    show.value = true
  }
}
</script>

<style lang="scss" scoped>
:deep(.van-nav-bar) {
  background-color: var(--cp-primary);
  .van-nav-bar__arrow,
  .van-nav-bar__title {
    color: #fff;
  }
}
:deep(.van-submit-bar) {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  .van-button {
    width: 200px;
  }
}
:deep(.van-cell) {
  .van-cell__title {
    font-size: 16px;
  }
  .van-cell__value {
    font-size: 16px;
  }
  &.price {
    .van-cell__value {
      font-size: 18px;
      color: var(--cp-price);
    }
  }
}
.order-pay-page {
  padding: 46px 0 65px;
}
.order-address {
  padding: 15px 15px 0 15px;
  background-color: #fff;
  font-size: 13px;
  .area {
    color: var(--cp-tag);
    margin-bottom: 5px;
    .van-icon-location {
      color: #ff7702;
      font-size: 14px;
    }
  }
  .detail {
    font-size: 17px;
    margin-bottom: 5px;
  }
  &::after {
    content: '';
    display: block;
    height: 12px;
    background-color: var(--cp-bg);
    margin: 0 -15px;
    margin-top: 15px;
  }
}

.order-tip {
  padding: 0 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  .tip {
    font-size: 12px;
    color: var(--cp-tag);
    width: 100%;
    &::before {
      content: '*';
      color: var(--cp-price);
      font-size: 14px;
    }
    margin-bottom: 30px;
  }
  .van-checkbox {
    a {
      color: var(--cp-primary);
    }
  }
}
</style>
