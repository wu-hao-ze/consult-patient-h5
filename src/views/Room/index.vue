<template>
  <div class="room-page">
    <cp-nav-bar title="医生问诊室" />
    <!-- 传入订单状态和倒计时时间给room-status组件 -->
    <room-status :status="consult?.status" :countdown="consult?.countdown" />
    <!-- 通过van-pull-refresh组件包裹消息列表，来实现下拉刷新加载更多 -->
    <!-- loading是加载状态，只要是触发了下拉刷新，loading就会自动变为true，refresh事件的触发条件是下拉刷新 -->
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <room-message :list="list" />
    </van-pull-refresh>
    <!-- 如果状态不是问诊中，就禁用发送文字和图片的功能 -->
    <room-action
      :disabled="consult?.status !== OrderType.ConsultChat"
      @send-text="sendText"
      @send-image="sendImage"
    />
  </div>
</template>

<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'

import { nextTick, onMounted, onUnmounted, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores'
import { io, type Socket } from 'socket.io-client'
import { Toast } from 'vant'
import type { ConsultOrderItem, Image } from '@/types/consult'
import type { Message, TimeMessages } from '@/types/room'
import { OrderType, MsgType } from '@/enums'
import { getConsultOrderDetail } from '@/services/consult'
import { baseURL } from '@/utils/request'

const store = useUserStore()
const route = useRoute()

let socket: Socket // 创建socket变量
const list = ref<Message[]>([]) // 接收下面聊天记录的消息列表，类型是Message[]，用来渲染到页面上
const consult = ref<ConsultOrderItem>() // 通过订单id获取的订单详情
const initialMsg = ref(true) // 用来判断是否是初始化的聊天记录，默认是true，代表第一次
const loading = ref(false) // 用来控制下拉刷新的loading状态，默认是false，意为不开启加载状态
const time = ref() // 用来把createTime传给后端返回以这个时间节点为结束的上一次的聊天记录，具体返回多少条根据pageSize

// 组件挂载完毕，进行socket连接
onMounted(async () => {
  // 建立连接，创建 socket.io 实例
  socket = io(
    // 第一个参数是请求的服务器地址，和在request.ts中设置的baseURL是一个值
    baseURL,
    // 第二个参数是配置对象
    {
      // auth是身份认证用的
      auth: {
        token: `Bearer ${store.user?.token}` // 把token发过去，因为只有登录进来的用户才能聊天
      },
      // query是地址栏上的查询参数
      query: {
        orderId: route.query.orderId // 把当前问诊的订单id传过去，方便确认是哪个问诊订单在问诊室聊天，保证医生和患者是一起的
        // 这里就用到了来到room时地址栏的查询参数：订单id，所以用route.query.orderId
      }
    }
  )
  // 连接成功，connect是固定写法
  socket.on('connect', () => {
    // 每次一连接的时候，就把list清空然后重新从第一次的记录开始获取
    // 避免断开连接之后再次连接，和之前的list的聊天记录重叠
    list.value = []
  })
  // 发生错误，error是固定写法
  socket.on('error', (event) => {
    console.log(event)
  })
  // 断开连接，disconnect是固定写法
  socket.on('disconnect', () => {
    console.log('disconnect')
  })
  // 聊天记录
  // 后端发来的消息类型是消息分组列表TimeMessages[]，要处理成可用的消息类型是消息列表Message[]
  // 消息分组列表TimeMessages[]中的items没有问诊室的时间，所以要自己拼接上createTime
  // 这里的返回的数据不会被request.ts中处理，也就是返回的数据的类型包括code，data和message，我们要的数据是data里面的，所以解构
  // { data: TimeMessages[] }的意思是对象中包含这个类型的就可以，前面提到过类型兼容，也就是对象的属性多可以传给属性少
  socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
    // 先判断如果data是空，则就是没有聊天记录了
    if (!data.length) {
      return Toast('没有聊天记录了')
    }
    const arr: Message[] = [] // 先利用arr来把TimeMessages[]改造成Message[]，然后再赋值给响应式数据list
    // 遍历data数组，重新组织arr数组
    data.forEach((data, i) => {
      // 把这一次的聊天记录的第一个消息的时间给到time，这样time就是这一次记录的最早时间
      if (i === 0) time.value = data.createTime
      // 添加一个自己创建的时间消息，就是问诊室的中间的胶囊状的时间消息
      arr.push({
        id: data.createTime, // 把时间当作id
        msgType: MsgType.Notify, // 枚举类型中的普通通知，为31
        createTime: data.createTime,
        msg: { content: data.createTime }
      })
      // 添加后台返回的消息分组中的消息数组，消息数组中包括患者卡片，以及消息提示和温馨提示等
      // 然后再加一个notScroll属性，第一次的聊天记录notScroll的值为false，第二次及以后的聊天记录notScroll的值都是true
      data.items.forEach((item) => {
        arr.push({ ...item, notScroll: initialMsg.value === false })
      })
    })
    // 将处理好的数据添加到list数组中，注意是往前面添加，用unshift
    list.value.unshift(...arr)
    console.log(arr)
    loading.value = false // 拿到聊天记录添加到list之后，就把loading状态关闭
    // 获取默认得到的第一次聊天记录时，自动滚动到最底部，而获取第二次以后的聊天记录不需要滚动到最底部
    // 上面的list更新之后，结构还没来得及更新，所以要使用nextTick等待页面更新完毕才能有dom渲染，然后再滚动到最底部
    nextTick(() => {
      if (initialMsg.value) {
        // 进入index.vue之后得到第一次聊天记录，然后就把消息设置为已读，传入的参数为最后一条消息的id，然后它上面的所有消息都已读
        socket.emit('updateMsgStatus', arr[arr.length - 1].id)
        window.scrollTo(0, document.body.scrollHeight)
        initialMsg.value = false
      }
    })
  })
  // 接收后台回复的消息，event是Message类型，所以可以直接添加到list消息列表，list是渲染到页面上的数据
  // event的类型是不包括自己设置的notScroll的
  socket.on('receiveChatMsg', async (event) => {
    list.value.push(event)
    // 因为list更新之后，结构还没来得及更新，所以要使用nextTick等待页面更新完毕才能有dom渲染，然后再滚动到最底部
    // nextTick(()=>{})放在nextTick回调函数里的是等待dom渲染完毕后执行的，也支持await的写法
    // 这里使用await之后，nextTick下方的代码就都是渲染完毕后再执行了
    await nextTick()
    // 因为在index.vue中，也就是在问诊室聊天里面，每次聊天接收到的消息都设置为已读
    socket.emit('updateMsgStatus', event.id)
    // 让页面滚动到最底部，第一个参数是x轴方向滚动到哪，第二个参数是y轴方向滚动到哪
    window.scrollTo(0, document.body.scrollHeight)
  })
  // 第一次获取聊天记录之后，不会触发statusChange，所以要单独拿出来，根据问诊订单id，获取订单详情
  const res = await getConsultOrderDetail(route.query.orderId as string)
  consult.value = res.data
  // 订单状态变化之后，通过statusChange触发，然后根据问诊订单id，获取订单详情，订单详情里面包含订单状态
  socket.on('statusChange', async () => {
    const res = await getConsultOrderDetail(route.query.orderId as string)
    consult.value = res.data
  })
})

// 获取聊天记录的方法是：记录这一次的聊天记录的最开始时间，作为下一次请求的聊天记录的结束时间
// 下一次请求的聊天记录的消息条数为pageSize条
const onRefresh = () => {
  // 后台约定的传参
  // 第一个参数是pageSize一页多少条，也就是根据第二个参数的时间点，然后往上找pageSize条消息记录
  // 第二个参数是这一次得到的聊天记录的最早时间，用来传给后端获取这一次的上一次的聊天记录
  // 第三个参数是orderId，用来区分是哪个问诊室
  socket.emit('getChatMsgList', 20, time.value, route.query.orderId)
}
// 接收room-action组件传来的文本信息，然后发送给服务器
const sendText = (text: string) => {
  // 根据后台约定发送消息
  socket.emit('sendChatMsg', {
    from: store.user?.id, // 发送人id
    to: consult.value?.docInfo?.id, // 接收人id
    msgType: MsgType.MsgText, // 消息类型
    msg: { content: text } // 消息主体
  })
}
// 接收room-action组件传来的图片信息，然后发送给服务器
const sendImage = (img: Image) => {
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: consult.value?.docInfo?.id,
    msgType: MsgType.MsgImage,
    msg: { picture: img }
  })
}

// 通过provide，跨级给后代evaluate-card组件提供数据
provide('consult', consult)
// 完成评价之后需要把该条未评价的信息改成已评价，并且将评分(星星数)传入评价内容中，为了在evaluate-card组件中渲染
const completeEva = (score: number) => {
  const item = list.value.find((item) => item.msgType === MsgType.CardEvaForm)
  if (item) {
    item.msg.evaluateDoc = { score }
    item.msgType = MsgType.CardEva
  }
}
// 之前props可以传函数，这里也是一样，provide也可以传函数
provide('completeEva', completeEva)

// 组件卸载关闭连接
onUnmounted(() => {
  socket.close()
})
</script>

<style lang="scss" scoped>
.room-page {
  padding-top: 90px;
  padding-bottom: 60px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--cp-bg);
  .van-pull-refresh {
    width: 100%;
    min-height: calc(100vh - 150px);
  }
}
</style>
