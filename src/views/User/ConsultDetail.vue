<template>
  <div class="consult-detail-page" v-if="item">
    <cp-nav-bar title="问诊详情" />
    <!-- 头部区域 -->
    <div class="detail-head">
      <div class="text">
        <h3>图文问诊 {{ item.payment }} 元</h3>
        <span
          class="sta"
          :class="{
            orange: item.status === OrderType.ConsultPay,
            green: item.status === OrderType.ConsultChat
          }"
        >
          {{ item.statusValue }}
        </span>
        <p class="tip">服务医生信息</p>
      </div>
      <div class="card">
        <img class="avatar" src="@/assets/avatar-doctor.svg" alt="" />
        <p class="doc">
          <span>极速问诊</span>
          <span>{{ item.docInfo?.name || '暂未分配医生' }}</span>
        </p>
        <van-icon name="arrow" />
      </div>
    </div>
    <!-- 患者就诊信息 -->
    <div class="detail-patient">
      <van-cell-group :border="false">
        <van-cell
          title="患者信息"
          :value="`${item.patientInfo.name} | ${item.patientInfo.genderValue} | ${item.patientInfo.age}岁`"
        />
        <van-cell
          title="患病时长"
          :value="getIllnessTimeText(item.illnessTime)"
        />
        <van-cell
          title="就诊情况"
          :value="getConsultFlagText(item.consultFlag)"
        />
        <van-cell title="病情描述" :label="item.illnessDesc" />
      </van-cell-group>
    </div>
    <!-- 订单信息 -->
    <div class="detail-order">
      <h3>订单信息</h3>
      <van-cell-group :border="false">
        <van-cell title="订单编号">
          <template #value>
            <span class="copy" @click="onCopy">复制</span>
            {{ item.orderNo }}
          </template>
        </van-cell>
        <van-cell title="创建时间" :value="item.createTime" />
        <van-cell title="应付款" :value="`￥${item.payment}`" />
        <van-cell title="优惠券" :value="`-￥${item.couponDeduction}`" />
        <van-cell title="积分抵扣" :value="`-￥${item.pointDeduction}`" />
        <van-cell
          title="实付款"
          :value="`￥${item.actualPayment}`"
          class="price"
        />
      </van-cell-group>
    </div>
    <!-- 待支付：支付金额+取消问诊+去支付 -->
    <div class="detail-time" v-if="item.status === OrderType.ConsultPay">
      请在
      <van-count-down :time="item.countdown * 1000" />
      内完成支付，超时订单将取消
    </div>
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultPay"
    >
      <div class="price">
        <span>需付款</span>
        <span>￥{{ item.actualPayment }}</span>
      </div>
      <!-- 如果item报类型可能是undefined的错，则可以使用非空断言，因为在最上面的v-if已经确定item一定有值才进来的 -->
      <van-button
        type="default"
        round
        size="small"
        :loading="loading"
        @click="cancelConsultOrder(item!)"
      >
        取消问诊
      </van-button>
      <van-button type="primary" round size="small" @click="show = true"
        >继续支付</van-button
      >
    </div>
    <!-- 待接诊：取消问诊+继续沟通 -->
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultWait"
    >
      <van-button
        type="default"
        round
        size="small"
        :loading="loading"
        @click="cancelConsultOrder(item!)"
      >
        取消问诊
      </van-button>
      <van-button
        type="primary"
        round
        size="small"
        :to="`/room?orderId=${item.id}`"
        >继续沟通</van-button
      >
    </div>
    <!-- 咨询中：查看处方(如果开了)+继续沟通 -->
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultChat"
    >
      <van-button
        type="default"
        round
        size="small"
        v-if="item.prescriptionId"
        @click="showPrescription(item?.prescriptionId)"
      >
        查看处方
      </van-button>
      <van-button
        type="primary"
        round
        size="small"
        :to="`/room?orderId=${item.id}`"
        >继续沟通</van-button
      >
    </div>
    <!-- 已完成：更多(查看处方(如果开了)，删除订单)+问诊记录 -->
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultComplete"
    >
      <div class="more">
        <van-popover
          placement="top-start"
          v-model:show="showPopover"
          :actions="actions"
          @select="onSelect"
        >
          <template #reference> 更多 </template>
        </van-popover>
      </div>
      <van-button
        type="primary"
        round
        size="small"
        :to="`/room?orderId=${item.id}`"
        >问诊记录</van-button
      >
    </div>
    <!-- 已取消：删除订单+咨询其他医生 -->
    <div
      class="detail-action van-hairline--top"
      v-if="item.status === OrderType.ConsultCancel"
    >
      <van-button
        type="default"
        round
        size="small"
        :loading="deleteLoading"
        @click="deleteConsultOrder(item!)"
      >
        删除订单
      </van-button>
      <van-button type="primary" round size="small" to="/"
        >咨询其他医生</van-button
      >
    </div>
    <!-- 底部支付的弹出 -->
    <cp-pay-sheet
      v-model:show="show"
      :order-id="item.id"
      :actualPayment="item.actualPayment"
      pay-callback="/room"
    />
  </div>
  <!-- 如果没有item，则白屏，利用骨架屏组件展示骨架屏 -->
  <div class="consult-detail-page" v-else>
    <cp-nav-bar title="问诊详情" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
  </div>
</template>

<script setup lang="ts">
import { useDeleteOrder, useShowPrescription } from '@/composable'
import { OrderType } from '@/enums'
import { getConsultOrderDetail } from '@/services/consult'
import type { ConsultOrderItem } from '@/types/consult'
import { getConsultFlagText, getIllnessTimeText } from '@/utils/filter'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCancelOrder } from '@/composable'
import router from '@/router'
import { useClipboard } from '@vueuse/core'
import { Toast } from 'vant'

// 通过地址栏上的订单id，来获取订单详情，并赋值给item
const route = useRoute()
const item = ref<ConsultOrderItem>()
onMounted(async () => {
  const res = await getConsultOrderDetail(route.params.id as string) // 获取动态参数用params，获取查询参数用query
  item.value = res.data
})
// 导入查看原始处方函数，取消问诊函数，删除订单函数
const { showPrescription } = useShowPrescription()
const { loading, cancelConsultOrder } = useCancelOrder()
const { loading: deleteLoading, deleteConsultOrder } = useDeleteOrder(() => {
  router.push('/user/consult')
})
// 气泡弹出层的使用，如果没有查看处方id就禁用查看处方按钮
const showPopover = ref(false)
const actions = computed(() => [
  { text: '查看处方', disabled: !item.value?.prescriptionId },
  { text: '删除订单' }
])
const onSelect = (action: { text: string }, index: number) => {
  // 根据索引来确定按钮功能
  if (index === 0) {
    showPrescription(item.value?.prescriptionId)
  }
  if (index === 1) {
    item.value && deleteConsultOrder(item.value)
  }
}

const show = ref(false) // 控制底部支付的显示与隐藏

// 利用vueuse中的useClipboard函数实现复制功能
const { copy, copied, isSupported } = useClipboard()
// copy(需要拷贝的内容)：复制需要拷贝的内容
// copied：是否拷贝成功，默认1.5s恢复状态，是ref类型的响应式数据
// isSupported：浏览器是否支持，需要授权读取粘贴板和写入粘贴板权限，是ref类型的响应式数据
const onCopy = () => {
  // 如果浏览器不支持，则提示不支持
  if (!isSupported.value) Toast('未授权，不支持')
  // 如果支持，那么复制订单编号
  // 因为item.value.orderNo可能是undefined，但是我们已经确定了它是存在的，所以可以使用类型断言
  copy(item.value?.orderNo as string)
}
// 监视copied，如果拷贝成功，则copied的值会发生变化，然后执行提示已复制
watch(copied, () => {
  if (copied.value) Toast('已复制')
})
</script>

<style lang="scss" scoped>
.consult-detail-page {
  padding: 46px 0 110px 0;
}
.detail-head {
  height: 140px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 135px;
    background: linear-gradient(
      180deg,
      rgba(44, 181, 165, 0),
      rgba(44, 181, 165, 0.2)
    );
    border-bottom-left-radius: 150px 20px;
    border-bottom-right-radius: 150px 20px;
  }
  padding: 15px;
  .text {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 10px 3px;
    .sta {
      color: var(--cp-tag);
      font-weight: 500;
      font-size: 16px;
      &.green {
        color: var(--cp-primary);
      }
      &.orange {
        color: #f2994a;
      }
    }
    .tip {
      width: 100%;
      color: var(--cp-text3);
      margin-top: 5px;
    }
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
    .avatar {
      width: 38px;
      height: 38px;
    }
    .doc {
      flex: 1;
      padding-left: 15px;
      > span {
        display: block;
        font-size: 16px;
        &:last-child {
          font-size: 13px;
          color: var(--cp-text3);
        }
      }
    }
    .van-icon {
      color: var(--cp-tip);
    }
  }
}
.detail-patient {
  &::after {
    content: '';
    display: block;
    height: 12px;
    background-color: var(--cp-bg);
  }
}
.detail-order {
  > h3 {
    padding: 10px 18px;
    font-weight: normal;
  }
  .copy {
    padding: 2px 10px;
    border: 1px solid var(--cp-primary);
    background-color: var(--cp-plain);
    color: var(--cp-primary);
    font-size: 12px;
    border-radius: 12px;
    margin-right: 10px;
  }
  :deep(.van-cell__title) {
    width: 70px;
    flex: none;
  }
  .price :deep(.van-cell__value) {
    font-size: 16px;
    color: var(--cp-price);
  }
}
.detail-action {
  height: 65px;
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  background-color: #fff;
  justify-content: flex-end;
  padding: 0 15px;
  box-sizing: border-box;
  .price {
    flex: 1;
    > span:last-child {
      font-size: 18px;
      color: var(--cp-price);
      padding-left: 5px;
    }
  }
  .van-button {
    margin-left: 10px;
    padding-left: 17px;
    padding-right: 17px;
  }
  :deep(.van-button--default) {
    background-color: var(--cp-bg);
    color: var(--cp-text3);
  }
  .more {
    flex: 1;
    color: var(--cp-primary);
  }
}
.van-cell {
  padding-left: 18px;
  padding-right: 18px;
}
.detail-time {
  position: fixed;
  left: 0;
  bottom: 65px;
  width: 100%;
  height: 44px;
  background-color: #fff7eb;
  text-align: center;
  line-height: 44px;
  font-size: 13px;
  color: #f2994a;
  .van-count-down {
    display: inline;
    color: #f2994a;
  }
}
</style>
