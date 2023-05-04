// 用户信息
export type User = {
  id: string
  account: string
  mobile: string
  avatar: string
  token: string
}

// 短信验证码类型，设置为字面量联合类型
export type CodeType =
  | 'login'
  | 'register'
  | 'changeMobile'
  | 'forgetPassword'
  | 'bindMobile'

// 个人信息
// 使用 交叉类型 可以复用 User 类型，但是不需要 token 属性
// 排除掉User中的token属性，再利用交叉类型加上新属性
type OmitUser = Omit<User, 'token'>
export type UserInfo = OmitUser & {
  likeNumber: number // 关注
  collectionNumber: number // 收藏
  score: number // 积分
  couponNumber: number // 优惠卷
  orderInfo: {
    paidNumber: number // 待付款
    receivedNumber: number // 待发货
    shippedNumber: number // 待收货
    finishedNumber: number // 已完成
  }
}

// 家庭档案-患者信息
export type Patient = {
  id?: string
  name: string
  idCard: string // 身份证号
  defaultFlag: 0 | 1 // 是否为默认患者，1为默认
  gender: 0 | 1 // 性别，1是男  0是女
  genderValue?: string // 性别值为字符串，男或者女
  age?: number
}

// 家庭档案-患者信息列表
export type PatientList = Patient[]
