<template>
  <div class="consult-item">
    <!-- 头部区域展示医生和订单状态 -->
    <div class="head van-hairline--bottom">
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p>{{ item.docInfo?.name || '暂未分配医生' }}</p>
      <span
        :class="{
          orange: item.status === OrderType.ConsultPay,
          green: item.status === OrderType.ConsultChat
        }"
      >
        {{ item.statusValue }}
      </span>
    </div>
    <!-- body区域点击之后跳转到问诊详情 -->
    <div class="body" @click="$router.push(`/user/consult/${item.id}`)">
      <div class="body-row">
        <div class="body-label">病情描述</div>
        <div class="body-value">{{ item.illnessDesc }}</div>
      </div>
      <div class="body-row">
        <div class="body-label">价格</div>
        <div class="body-value">¥ {{ item.payment.toFixed(2) }}</div>
      </div>
      <div class="body-row">
        <div class="body-label">创建时间</div>
        <div class="body-value tip">{{ item.createTime }}</div>
      </div>
    </div>
    <!-- 底部按钮是根据订单状态展示不同的按钮 -->
    <!-- 待支付：取消问诊+去支付 -->
    <div class="foot" v-if="item.status === OrderType.ConsultPay">
      <van-button
        class="gray"
        plain
        size="small"
        :loading="loading"
        round
        @click="cancelConsultOrder(item)"
      >
        取消问诊
      </van-button>
      <van-button
        type="primary"
        plain
        size="small"
        round
        :to="`/user/consult/${item.id}`"
      >
        去支付
      </van-button>
    </div>
    <!-- 待接诊：取消问诊+继续沟通 -->
    <div class="foot" v-if="item.status === OrderType.ConsultWait">
      <van-button
        class="gray"
        plain
        size="small"
        :loading="loading"
        round
        @click="cancelConsultOrder(item)"
      >
        取消问诊
      </van-button>
      <van-button
        type="primary"
        plain
        size="small"
        round
        :to="`/room?orderId=${item.id}`"
      >
        继续沟通
      </van-button>
    </div>
    <!-- 咨询中：查看处方(如果开了)+继续沟通 -->
    <div class="foot" v-if="item.status === OrderType.ConsultChat">
      <van-button
        v-if="item.prescriptionId"
        class="gray"
        @click="showPrescription(item.prescriptionId)"
        plain
        size="small"
        round
      >
        查看处方
      </van-button>
      <van-button
        type="primary"
        plain
        size="small"
        round
        :to="`/room?orderId=${item.id}`"
      >
        继续沟通
      </van-button>
    </div>
    <!-- 已完成：更多(查看处方(如果开了)，删除订单）+问诊记录 -->
    <div class="foot" v-if="item.status === OrderType.ConsultComplete">
      <div class="more">
        <!-- v-model:show是否展示气泡弹出层，点击之后showPopover就是true，默认设置成false -->
        <!-- actions是选项列表，placement是弹出位置 -->
        <!-- select事件是点击选项列表中的选项时触发，回调函数有两个参数，一个是每个选项action，一个是index索引 -->
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
        plain
        size="small"
        round
        :to="`/room?orderId=${item.id}`"
      >
        问诊记录
      </van-button>
    </div>
    <!-- 已取消：删除订单+咨询其他医生 -->
    <div class="foot" v-if="item.status === OrderType.ConsultCancel">
      <van-button
        class="gray"
        plain
        size="small"
        round
        :loading="deleteLoading"
        @click="deleteConsultOrder(item)"
      >
        删除订单
      </van-button>
      <van-button type="primary" plain size="small" round to="/"
        >咨询其他医生</van-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConsultOrderItem } from '@/types/consult'
import { OrderType } from '@/enums'
import { computed, ref } from 'vue'
import {
  useCancelOrder,
  useDeleteOrder,
  useShowPrescription
} from '@/composable'

const props = defineProps<{ item: ConsultOrderItem }>()
const emit = defineEmits<{
  (e: 'on-delete', id: string): void
}>()

const { showPrescription } = useShowPrescription()
const { loading, cancelConsultOrder } = useCancelOrder()
// 解构后的重新命名，利用loading: deleteLoading，之所以重新命名为deleteLoading是为了和上面取消问诊的loading做区分
const { loading: deleteLoading, deleteConsultOrder } = useDeleteOrder(() => {
  emit('on-delete', props.item.id)
})

const showPopover = ref(false) // 默认设置为false，等点击后就会自动更改为true展示，点击其他地方后就会自动更改为false不展示
// actions一定要利用计算属性，来实现响应式数据，因为处方id可能有也可能没有
// 如果处方id状态改变，但凡actions不是响应式数据的话，页面中的结构就改变不了
const actions = computed(() => {
  if (props.item.prescriptionId)
    return [{ text: '查看处方' }, { text: '删除订单' }]
  else return [{ text: '删除订单' }]
})
// select事件处理函数有两个参数，一个是action，一个是index
const onSelect = (action: { text: string }) => {
  if (action.text === '查看处方') {
    showPrescription(props.item.prescriptionId) // 查看原始处方
  }
  if (action.text === '删除订单') {
    deleteConsultOrder(props.item) // 删除订单
  }
}
</script>

<style lang="scss" scoped>
.consult-item {
  border-radius: 4px;
  box-shadow: 0px 0px 22px 0px rgba(245, 245, 245, 0.1);
  background-color: #fff;
  margin-bottom: 10px;
  .head {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 15px;
    .img {
      width: 20px;
      height: 20px;
    }
    > p {
      flex: 1;
      font-size: 15px;
      padding-left: 10px;
    }
    > span {
      color: var(--cp-tag);
      &.orange {
        color: #f2994a;
      }
      &.green {
        color: var(--cp-primary);
      }
    }
  }
  .body {
    padding: 15px 15px 8px 15px;
    .body-row {
      display: flex;
      margin-bottom: 7px;
    }
    .body-label {
      width: 62px;
      font-size: 13px;
      color: var(--cp-tip);
    }
    .body-value {
      width: 250px;
      &.tip {
        color: var(--cp-tip);
      }
    }
  }
  .foot {
    padding: 0 15px 15px 15px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .van-button {
      margin-left: 10px;
      padding: 0 16px;
      &.gray {
        color: var(--cp-text3);
        background-color: var(--cp-bg);
      }
    }
    .more {
      color: var(--cp-primary);
      flex: 1;
      font-size: 13px;
    }
  }
}
</style>
