<template>
  <div class="consult-pay-page">
    <cp-nav-bar title="支付" />
    <!-- 初始的时候payInfo是undefined，所以要在最开始加上一个类型守卫，下面就不用payInfo?了 -->
    <div v-if="payInfo">
      <div class="pay-info">
        <p class="tit">图文问诊 {{ payInfo.payment }} 元</p>
        <img class="img" src="@/assets/avatar-doctor.svg" />
        <p class="desc">
          <span>极速问诊</span>
          <span>自动分配医生</span>
        </p>
      </div>
      <!-- 单元格组件 -->
      <van-cell-group>
        <van-cell title="优惠券" :value="`-¥${payInfo.couponDeduction}`" />
        <van-cell title="积分抵扣" :value="`-¥${payInfo.pointDeduction}`" />
        <van-cell
          title="实付款"
          :value="`¥${payInfo.actualPayment}`"
          class="pay-price"
        />
      </van-cell-group>
      <div class="pay-space"></div>
      <van-cell-group>
        <van-cell
          title="患者信息"
          :value="`${patient?.name} | ${patient?.genderValue} | ${patient?.age}岁`"
        ></van-cell>
        <van-cell
          title="病情描述"
          :label="store.consult.illnessDesc"
        ></van-cell>
      </van-cell-group>
      <div class="pay-schema">
        <van-checkbox v-model="agree"
          >我已同意 <span class="text">支付协议</span></van-checkbox
        >
      </div>
      <van-submit-bar
        button-type="primary"
        :price="payInfo.actualPayment * 100"
        button-text="立即支付"
        text-align="left"
        :loading="loading"
        @submit="submit"
      />
      <!-- 封装底部弹出支付方式的抽屉组件 -->
      <!-- onClose作为可选属性传给组件，传的是函数 -->
      <cp-pay-sheet
        v-model:show="show"
        :order-id="orderId"
        :actualPayment="payInfo.actualPayment"
        :onClose="onClose"
        pay-callback="/room"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { createConsultOrder, getConsultOrderPre } from '@/services/consult'
import { getPatientDetail } from '@/services/user'
import { useConsultStore } from '@/stores'
import type { ConsultOrderPreData } from '@/types/consult'
import type { Patient } from '@/types/user'
import { Dialog, Toast } from 'vant'
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

const store = useConsultStore()
// 根据问诊类型和三甲还是普通，获取订单信息
const payInfo = ref<ConsultOrderPreData>()
const loadData = async () => {
  const res = await getConsultOrderPre({
    type: store.consult.type,
    illnessType: store.consult.illnessType
  })
  payInfo.value = res.data
  // 存储优惠券的id，至此pinia的数据就全了
  store.setCoupon(payInfo.value.couponId)
}
// 根据患者id获取患者信息
const patient = ref<Patient>()
const loadPatient = async () => {
  if (!store.consult.patientId) return
  const res = await getPatientDetail(store.consult.patientId)
  patient.value = res.data
}

onMounted(() => {
  // 如果这四个信息有一个没有值，就会弹窗报温馨提示
  // 如果在生成订单id之后的选择支付方式的时候刷新页面，那么此时因为已经清空store，所以没有数据了，这个时候就会报这个温馨提示
  if (
    !store.consult.type ||
    store.consult.illnessType === undefined ||
    !store.consult.depId ||
    !store.consult.patientId
  ) {
    return Dialog.alert({
      title: '温馨提示',
      message: '支付信息不完整请重新填写，如果未支付可以去问诊记录继续支付'
    }).then(() => {
      // 跳转到问诊记录
      router.push('/user')
    })
  }
  loadData()
  loadPatient()
})

const agree = ref(false) // 复选框的同意协议
const show = ref(false) // 底部抽屉弹出的显示与隐藏
const loading = ref(false) // 点击支付按钮之后的loading
const orderId = ref('') // 问诊订单id
// 点击立即支付之后
const submit = async () => {
  // 如果没有勾选支付协议，则提示
  if (!agree.value) return Toast('请勾选我已同意支付协议')
  // 开启loading
  loading.value = true
  // 生成订单id，为了将来和支付方式一起生成支付地址
  const res = await createConsultOrder(store.consult)
  orderId.value = res.data.id
  // 关闭loading
  loading.value = false
  // 把订单的信息全都发给后台了，最后得到的订单id就是目标，所以生成后就可以清空记录
  store.clear()
  // 展示抽屉
  show.value = true
}
const router = useRouter()
const onClose = () => {
  // Dialog.confirm返回值就是个promise正好用于cp-pay-sheet组件的van-action-sheet的before-close
  return Dialog.confirm({
    title: '关闭支付',
    message: '取消支付将无法获得医生回复，医生接诊名额有限，是否确认关闭？',
    cancelButtonText: '仍要关闭',
    confirmButtonText: '继续支付',
    confirmButtonColor: 'var(--cp-primary)'
  })
    .then(() => {
      // 继续支付，在cp-pay-sheet组件中可以看到van-action-sheet组件返回false可以阻止关闭
      return false
    })
    .catch(() => {
      // 仍要关闭，跳转到问诊记录
      orderId.value = '' // 一定要有这个，否则下面的拦截守卫就会一直拦截在这个页面中，永远也出不去了
      router.push('/user/consult')
      return true
    })
}
// 添加一个导航守卫，在当前位置的组件将要离开时触发，组件被卸载时导航守卫被移除
onBeforeRouteLeave(() => {
  // 这个组合式api返回false就会阻止离开
  // 如果已经生成订单id了，那么就返回false，这样点返回按钮就返回不了了
  // 所以想退出本页面的唯一方法就是把orderId清空
  // 点击空白处弹出弹窗，然后点击仍要关闭，就会跳转到问诊记录页面
  if (orderId.value) return false
})
</script>

<style lang="scss" scoped>
.consult-pay-page {
  padding: 46px 0 50px 0;
}
.pay-info {
  display: flex;
  padding: 15px;
  flex-wrap: wrap;
  align-items: center;
  .tit {
    width: 100%;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .img {
    margin-right: 10px;
    width: 38px;
    height: 38px;
    border-radius: 4px;
    overflow: hidden;
  }
  .desc {
    flex: 1;
    > span {
      display: block;
      color: var(--cp-tag);
      &:first-child {
        font-size: 16px;
        color: var(--cp-text2);
      }
    }
  }
}
.pay-price {
  ::v-deep() {
    .vam-cell__title {
      font-size: 16px;
    }
    .van-cell__value {
      font-size: 16px;
      color: var(--cp-price);
    }
  }
}
.pay-space {
  height: 12px;
  background-color: var(--cp-bg);
}
.pay-schema {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  .text {
    color: var(--cp-primary);
  }
}
::v-deep() {
  .van-submit-bar__button {
    font-weight: normal;
    width: 160px;
  }
}
</style>
