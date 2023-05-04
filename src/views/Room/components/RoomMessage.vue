<template>
  <!-- 在外面套一个template是因为不想生成多余的标签，但是却可以使用v-for -->
  <!-- 因为每个消息类型都不一样，所以区分类型用v-if，注意v-if是不分先后顺序的，而渲染所有列表数据要使用v-for -->
  <template
    v-for="{ msgType, msg, createTime, from, notScroll } in list"
    :key="msg.id"
  >
    <!-- 患者卡片 -->
    <div class="msg msg-illness" v-if="msgType === MsgType.CardPat">
      <template v-if="msg.consultRecord">
        <div class="patient van-hairline--bottom">
          <p>
            {{ msg.consultRecord.patientInfo.name }}
            {{ msg.consultRecord.patientInfo.genderValue }}
            {{ msg.consultRecord.patientInfo.age }}岁
          </p>
          <p>
            <!-- 这两个函数在utils下的filter.ts中 -->
            {{ getIllnessTimeText(msg.consultRecord.illnessTime) }} |
            {{ getConsultFlagText(msg.consultRecord.consultFlag) }}
          </p>
        </div>
        <van-row>
          <van-col span="6">病情描述</van-col>
          <van-col span="18">{{ msg.consultRecord.illnessDesc }}</van-col>
          <van-col span="6">图片</van-col>
          <van-col span="18" @click="previewImg(msg.consultRecord!.pictures)">
            点击查看
          </van-col>
        </van-row>
      </template>
    </div>
    <!-- 温馨提示 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.NotifyTip">
      <div class="content">
        <span class="green">温馨提示：</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <!-- 通用通知 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.Notify">
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <!-- 患者发的文字消息 -->
    <div
      class="msg msg-to"
      v-if="msgType === MsgType.MsgText && store.user?.id === from"
    >
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
      <van-image :src="store.user?.avatar" />
    </div>
    <!-- 患者发的图片消息 -->
    <div
      class="msg msg-to"
      v-if="msgType === MsgType.MsgImage && store.user?.id === from"
    >
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <!-- 因为dom渲染完成之后滚动到最底部，但图片有额外的加载时间，所以发完图片无法滚动到最底部 -->
        <!-- 可以利用load来监听图片加载完毕，然后在事件处理函数中再加一个滚动到最底部 -->
        <van-image
          @load="loadSuccess(notScroll)"
          fit="contain"
          :src="msg.picture?.url"
        />
      </div>
      <van-image :src="store.user?.avatar" />
    </div>
    <!-- 医生发的文字消息，判断的时候from发信人不是患者，那就是医生通过服务器发来的 -->
    <div
      class="msg msg-from"
      v-if="msgType === MsgType.MsgText && store.user?.id !== from"
    >
      <van-image :src="avatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
    </div>
    <!-- 医生发的图片消息 -->
    <div
      class="msg msg-from"
      v-if="msgType === MsgType.MsgImage && store.user?.id !== from"
    >
      <van-image :src="avatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <van-image
          @load="loadSuccess(notScroll)"
          fit="contain"
          :src="msg.picture?.url"
        />
      </div>
    </div>
    <!-- 处方 -->
    <div class="msg msg-recipe" v-if="msgType === MsgType.CardPre">
      <div class="content" v-if="msg.prescription">
        <div class="head van-hairline--bottom">
          <div class="head-tit">
            <h3>电子处方</h3>
            <p @click="showPrescription(msg.prescription?.id)">
              原始处方 <van-icon name="arrow"></van-icon>
            </p>
          </div>
          <p>
            {{ msg.prescription.name }}
            {{ msg.prescription.genderValue }}
            {{ msg.prescription.age }}岁
            {{ msg.prescription.diagnosis }}
          </p>
          <p>开方时间：{{ msg.prescription.createTime }}</p>
        </div>
        <div class="body">
          <div
            class="body-item"
            v-for="med in msg.prescription.medicines"
            :key="med.id"
          >
            <div class="durg">
              <p>{{ med.name }} {{ med.specs }}</p>
              <p>{{ med.usageDosag }}</p>
            </div>
            <div class="num">x{{ med.quantity }}</div>
          </div>
        </div>
        <div class="foot" @click="buy(msg.prescription)">
          <span>购买药品</span>
        </div>
      </div>
    </div>
    <!-- 评价 -->
    <div
      class="msg msg-comment"
      v-if="msgType === MsgType.CardEva || msgType === MsgType.CardEvaForm"
    >
      <!-- 传入评价信息，用来在评价卡片中判断到底是已评价还是未评价 -->
      <evaluate-card :evaluateDoc="msg.evaluateDoc" />
    </div>
    <!-- 结束问诊消息 -->
    <div
      class="msg msg-tip msg-tip-cancel"
      v-if="msgType === MsgType.NotifyCancel"
    >
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import EvaluateCard from './EvaluateCard.vue'
import { MsgType, PrescriptionStatus } from '@/enums'
import { ImagePreview, Toast } from 'vant'
import avatar from '@/assets/avatar-doctor.svg'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores'
import type { Message, Prescription } from '@/types/room'
import type { Image } from '@/types/consult'
import { useRouter } from 'vue-router'
import { getConsultFlagText, getIllnessTimeText } from '@/utils/filter'
import { useShowPrescription } from '@/composable'

const store = useUserStore()
defineProps<{ list: Message[] }>()

// 点击查看图片，借助vant组件的ImagePreview函数预览图片，函数中传入一个数组，数组中是图片的地址(字符串类型)
const previewImg = (pictures: Image[]) => {
  if (pictures && pictures.length)
    // 把Image类型的数组转成url地址字符串的数组
    ImagePreview(pictures.map((item) => item.url))
}

// 利用dayjs来格式化时间
const formatTime = (time: string) => dayjs(time).format('HH:mm')

// 图片加载完毕之后页面滚动到最底部
// 如果是发消息中的图片，是没有notScroll的，所以上面最开始解构都没有这个数据，notScroll是undefined
// 如果是第一次的聊天记录中的图片，notScroll的值为false，如果是第二次及以后的聊天记录中的图片，notScroll的值为true
const loadSuccess = (notScroll?: boolean) => {
  if (!notScroll) window.scrollTo(0, document.body.scrollHeight)
}

// 点击查看原始处方
const { showPrescription } = useShowPrescription()

// 购买药品
const router = useRouter()
const buy = (pre?: Prescription) => {
  if (pre) {
    // 如果处方失效，则提示
    if (pre.status === PrescriptionStatus.Invalid) return Toast('处方已失效')
    // 如果没付款且没有药品订单id，则携带处方id去药品支付页面
    if (pre.status === PrescriptionStatus.NotPayment && !pre.orderId)
      return router.push(`/order/pay?id=${pre.id}`) // pre.id是处方id
    // 如果已付款或者没付款但有药品订单id，则去药品订单详情页面
    // 没付款但有药品订单id的情况是，在支付药品是点击立即支付后就会生成药品订单，但是弹出底部选择支付方式的时候取消了
    // 和之前的生成问诊订单类似，也是点击支付就会生成订单，但是选择支付方式的时候可以取消，那么此时就是没付款但有订单
    router.push(`/order/${pre.orderId}`) // pre.orderId是药品订单id
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/room.scss';
</style>
