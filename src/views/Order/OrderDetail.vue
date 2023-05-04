<template>
  <div class="order-detail-page" v-if="order">
    <cp-nav-bar title="药品订单详情" />
    <div class="order-head" v-if="order.expressInfo">
      <!-- 如果有物流信息，则跳转到物流详情页面 -->
      <div class="card" @click="$router.push(`/order/logistics/${order?.id}`)">
        <div class="logistics">
          <p>{{ order.expressInfo?.content }}</p>
          <p>{{ order.expressInfo?.time }}</p>
        </div>
        <van-icon name="arrow" />
      </div>
    </div>
    <order-medical :medicines="order?.medicines" />
    <div class="order-detail">
      <van-cell-group>
        <van-cell title="药品金额" :value="`￥${order.payment}`" />
        <van-cell title="运费" :value="`￥${order.expressFee}`" />
        <van-cell title="优惠券" :value="`-￥${order.couponDeduction}`" />
        <van-cell
          title="实付款"
          :value="`￥${order.actualPayment.toFixed(2)}`"
          class="price"
        />
        <van-cell title="订单编号" :value="order.orderNo" />
        <van-cell title="创建时间" :value="order.createTime" />
        <van-cell title="支付时间" :value="order.payTime" />
        <van-cell
          title="支付方式"
          :value="order.paymentMethod === 0 ? '微信' : '支付宝'"
        />
      </van-cell-group>
    </div>
    <!-- 已取消 -->
    <van-action-bar v-if="order.status === OrderType.MedicineCancel">
      <van-action-bar-icon icon="delete-o" text="删除" />
      <van-action-bar-button type="primary" text="沟通记录" />
    </van-action-bar>
    <!-- 待支付 -->
    <van-action-bar v-if="order.status === OrderType.MedicinePay">
      <p class="price">
        需要支付：<span>￥{{ order.actualPayment.toFixed(2) }}</span>
      </p>
      <van-action-bar-button color="#bbb" text="取消订单" />
      <van-action-bar-button
        type="primary"
        text="继续支付"
        @click="show = true"
        :loading="loading"
      />
      <cp-pay-sheet
        :orderId="order.id"
        :actualPayment="order.actualPayment"
        v-model:show="show"
        payCallback="/order/pay/result"
      />
    </van-action-bar>
    <!-- 待发货 -->
    <van-action-bar v-if="order.status === OrderType.MedicineSend">
      <van-action-bar-button type="primary" text="提醒发货" />
    </van-action-bar>
    <!-- 待收货 -->
    <van-action-bar v-if="order.status === OrderType.MedicineTake">
      <van-action-bar-button type="primary" text="确认收货" />
    </van-action-bar>
    <!-- 已完成 -->
    <van-action-bar v-if="order.status === OrderType.MedicineComplete">
      <van-action-bar-icon icon="delete-o" text="删除" />
      <van-action-bar-button type="primary" text="再次购买" />
    </van-action-bar>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useOrderDetail } from './hooks'
import OrderMedical from './components/OrderMedical.vue'
import { OrderType } from '@/enums'
import { ref } from 'vue'

const route = useRoute()
// 进入到页面后地址栏上会有动态路由参数，那个就是药品订单id
const { order } = useOrderDetail(route.params.id as string)

const show = ref(false) // 底部弹出支付方式的显示与隐藏
const loading = ref(false) // 点击立即支付之后的加载状态
</script>

<style lang="scss" scoped>
.order-detail-page {
  padding-top: 46px;
  padding-bottom: 65px;
}
.order-head {
  position: relative;
  padding: 15px;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 80px;
    background: linear-gradient(
      180deg,
      rgba(44, 181, 165, 0),
      rgba(44, 181, 165, 0.2)
    );
    border-bottom-left-radius: 150px 20px;
    border-bottom-right-radius: 150px 20px;
  }
  .card {
    height: 74px;
    background-color: #fff;
    border-radius: 8px;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 15px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    .logistics {
      flex: 1;
      p {
        &:first-child {
          color: var(--cp-primary);
        }
        &:last-child {
          color: var(--cp-tag);
          font-size: 13px;
          margin-top: 5px;
        }
      }
    }
    .van-icon {
      color: var(--cp-tip);
    }
  }
}

.van-action-bar {
  padding: 0 10px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  .price {
    padding: 0 10px;
    > span {
      font-size: 18px;
      color: var(--cp-price);
    }
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
</style>
