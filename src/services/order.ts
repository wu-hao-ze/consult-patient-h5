import type {
  AddressItem,
  Logistics,
  OrderDetail,
  OrderPre
} from '@/types/order'
import { request } from '@/utils/request'

// 获取药品订单预支付信息
export const getMedicalOrderPre = (params: { prescriptionId: string }) =>
  request<OrderPre>('/patient/medicine/order/pre', 'GET', params)

// 获取收货地址列表
export const getAddressList = () =>
  request<AddressItem[]>('/patient/order/address')

// 创建药品订单，返回药品订单id
export const createMedicalOrder = (data: {
  id: string
  addressId: string
  couponId?: string
}) => request<{ id: string }>('/patient/medicine/order', 'POST', data)

// 获取药品订单详情
export const getMedicalOrderDetail = (id: string) =>
  request<OrderDetail>(`/patient/medicine/order/detail/${id}`)

// 获取药品订单物流信息
export const getMedicalOrderLogistics = (id: string) =>
  request<Logistics>(`/patient/order/${id}/logistics`)
