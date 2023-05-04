import { MsgType, PrescriptionStatus } from '@/enums'
import type { Consult, Image } from './consult'
import type { Patient } from './user'

// 药品
export type Medical = {
  id: string
  name: string
  amount: string // 药品金额
  avatar: string // 药品图片
  specs: string // 规格信息
  usageDosag: string // 用法用量
  quantity: string // 数量
  prescriptionFlag: 0 | 1 // 是否是处方，0表示不是，1表示是
}

// 处方
export type Prescription = {
  id: string // 处方id
  createTime: string // 创建时间
  name: string // 患者姓名
  recordId: string // 问诊记录id
  gender: 0 | 1 // 性别，0是女，1是男
  genderValue: string // 性别值，男/女
  age: number
  diagnosis: string // 诊断信息
  orderId: string // 药品订单id
  status: PrescriptionStatus // 处方状态
  medicines: Medical[] // 药品清单
}

// 评价
export type EvaluateDoc = {
  id?: string
  score?: number
  content?: string
  createTime?: string
  creator?: string // 创建人
}

// 消息
export type Message = {
  id: string
  msgType: MsgType // 消息类型
  from?: string // 发信人
  fromAvatar?: string // 发信人头像
  to?: string // 收信人
  toAvatar?: string // 收信人头像
  createTime: string
  // 消息主体
  msg: {
    content?: string // 文字消息
    picture?: Image // 图片消息
    // 问诊记录
    consultRecord?: Consult & {
      patientInfo: Patient // 患者信息
    }
    prescription?: Prescription // 处方信息
    evaluateDoc?: EvaluateDoc // 评价信息
  }
  // 自己加一个类型，用来判断发消息中的图片还是第二次及以后的聊天记录中的图片
  // 因为如果是对话中的图片，第一次聊天记录中的图片是要触发图片加载完毕滚动到页面最底部
  // 如果是第二次及以后的聊天记录中的图片要设置不需要滚动，也就是设置notScroll为true
  notScroll?: boolean
}

// 消息分组列表，一个时间段对应一个消息分组，比如10点到12点有18条消息，这个区间的消息就是一个消息分组
export type TimeMessages = {
  createTime: string // 一个消息分组中消息的最早时间
  items: Message[] // 消息数组
  orderId: string // 问诊订单id
  sid: string // 会话id，这个我们在渲染结构的时候用不上
}
