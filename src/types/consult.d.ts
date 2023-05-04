import { ConsultType, IllnessTime, OrderType } from '@/enums'
import type { Patient } from './user'

// 文章类型
export type KnowledgeType = 'like' | 'recommend' | 'fatReduction' | 'food'

// 文章信息类型
export type Knowledge = {
  id: string
  title: string
  coverUrl: string[] // 封面
  topics: string[] // 标签
  collectionNumber: number // 收藏数
  commentNumber: number // 评论数
  creatorName: string // 医生名称
  creatorAvatar: string // 医生头像
  creatorHospatalName: string // 医生医院名称
  likeFlag: 0 | 1 // 是否关注文章
  content: string // 内容
  creatorDep: string // 医生科室
  creatorTitles: string // 医生职称
  creatorId: string // 医生id
}

// 文章列表
export type KnowledgeList = Knowledge[]

// 文章列表带分页
export type KnowledgePage = {
  pageTotal: number // 总页数
  total: number // 总条数
  rows: KnowledgeList // 文章列表数组
}

// 通用的分页查询参数
export type PageParams = {
  current: number // 当前页
  pageSize: number // 一页多少条
}

// 文章列表查询参数
export type KnowledgeParams = PageParams & {
  type: KnowledgeType
}

// 医生卡片
export type Doctor = {
  id: string
  name: string
  avatar: string
  hospitalName: string
  gradeName: string // 医院等级
  depName: string // 科室
  positionalTitles: string // 职称
  likeFlag: 0 | 1 // 是否关注医生
  serviceFee: number // 接诊服务费
  consultationNum: number // 接诊人数
  score: number // 评分
  major: string // 主攻方向
}

// 医生列表
export type DoctorList = Doctor[]

// 医生分页
export type DoctorPage = {
  pageTotal: number
  total: number
  rows: DoctorList
}

// 关注的类型：医生|文章|话题|疾病
export type FollowType = 'doc' | 'knowledge' | 'topic' | 'disease'

// 图片信息
export type Image = {
  id: string
  url: string // 图片地址
}

// 问诊记录
export type Consult = {
  id: string // 问诊订单id，在consult.ts中的getConsultOrderDetail的返回值的数据中，会有问诊订单id，值就是之前的orderId
  type: ConsultType // 问诊类型
  illnessType: 0 | 1 // 极速问诊类型，0表示普通，1表示三甲
  depId: string // 科室id
  illnessDesc: string // 病情描述
  illnessTime: IllnessTime // 病情持续时间
  consultFlag: 0 | 1 // 是否就诊过，0表示未就诊过，1表示就诊过
  pictures: Image[] // 图片列表
  patientId: string // 患者id
  couponId: string // 优惠券id
}

// 问诊记录-全部可选
// 注意问诊记录的参数全部可选，是因为信息是一点一点累加上去的，每进入一步就会记录一项，最后放到一起
export type PartialConsult = Partial<Consult>

// 问诊记录-病情描述的信息-四项可选
export type ConsultIllness = Pick<
  PartialConsult,
  'illnessDesc' | 'illnessTime' | 'consultFlag' | 'pictures'
>

// 二级科室
export type SubDep = {
  id: string
  name: string
}

// 一级科室
export type TopDep = SubDep & {
  child: SubDep[]
}

// 预支付的金额的传参，两项可选，问诊类型(这里是极速问诊)和极速问诊的级别(是普通还是三甲)
export type ConsultOrderPreParams = Pick<PartialConsult, 'type' | 'illnessType'>

// 问诊订单预支付信息返回的参数类型
export type ConsultOrderPreData = {
  pointDeduction: number // 积分抵扣
  couponDeduction: number // 优惠券抵扣
  couponId: string // 优惠券id
  payment: number // 需付款金额
  actualPayment: number // 实付款金额
}

// 问诊订单的每一项的信息详情
export type ConsultOrderItem = Consult & {
  createTime: string
  docInfo?: Doctor // 接诊医生信息
  patientInfo: Patient // 患者信息
  orderNo: string // 订单编号
  status: OrderType // 订单状态
  statusValue: string // 订单状态的文字表示
  typeValue: string // 问诊类型文字
  countdown: number // 倒计时时间
  prescriptionId?: string // 处方id
  evaluateId: number // 评价id
  payment: number // 应付款
  couponDeduction: number // 优惠券抵扣
  pointDeduction: number // 积分抵扣
  actualPayment: number // 实付款
}

// 问诊记录带分页
export type ConsultOrderPage = {
  pageTotal: number // 总页数
  total: number // 总条数
  rows: ConsultOrderItem[] // 问诊记录数组，每一个问诊记录就是问诊订单的每一项的信息详情
}

// 问诊记录查询参数
export type ConsultOrderListParams = PageParams & {
  type: ConsultType
}
