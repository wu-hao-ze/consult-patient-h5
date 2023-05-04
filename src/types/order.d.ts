import { ExpressStatus, OrderType } from '@/enums'
import type { Medical } from './room'

// 药品订单预支付信息
export type OrderPre = {
  id: string // 处方id
  couponId: string // 优惠券id
  pointDeduction: number // 积分抵扣
  couponDeduction: number // 优惠券抵扣
  payment: number // 应付款
  expressFee: number // 邮费
  actualPayment: number // 实付款
  medicines: Medical[] // 药品数组
}

// 收货地址
export type AddressItem = {
  id: string // 地址id
  mobile: string // 联系方式
  receiver: string // 收件人
  province: string // 省
  city: string // 市
  county: string // 区
  addressDetail: string // 详细地址
  isDefault: 0 | 1 // 是否是默认地址
  postalCode: string // 邮编
}

// 用于下面的药品订单详情中的addressInfo
type Address = Omit<AddressItem, 'isDefault'>

// 药品订单详情
export type OrderDetail = {
  id: string // 药品订单id
  orderNo: string // 药品订单编号
  type: 4 // 订单类型
  createTime: string // 创建时间
  prescriptionId: string // 处方id
  status: OrderType // 订单状态
  statusValue: string // 订单状态的文字表示
  medicines: Medical[] // 药品
  countDown: number // 支付倒计时
  addressInfo: Address // 收货地址
  // 物流信息
  expressInfo: {
    content: string // 物流最新位置
    time: string // 物流最新时间
  }
  payTime: string // 支付时间
  paymentMethod?: 0 | 1 // 支付方式，0是微信，1是支付宝
  payment: number // 应付款
  pointDeduction: number // 积分抵扣
  couponDeduction: number // 优惠券抵扣
  expressFee: number // 邮费
  actualPayment: number // 实付款
  roomId: string // 问诊订单id，用于回到问诊室
}

// 物流信息
export type Express = {
  id: string
  content: string // 物流内容
  createTime: string
  status: ExpressStatus // 物流状态
  statusValue: string // 物流状态的文字表示
}

// 轨迹信息(运输位置)
export type Location = {
  longitude: string // 经度
  latitude: string // 纬度
}

// 药品订单物流信息
export type Logistics = {
  estimatedTime: string // 预计送达时间
  name: string // 物流公司名称
  awbNo: string // 物流编号
  status: ExpressStatus // 物流状态
  statusValue: string // 物流状态的文字表示
  list: Express[] // 物流信息数组
  logisticsInfo: Location[] // 轨迹信息数组
  currentLocationInfo: Location // 当前运输位置
}
