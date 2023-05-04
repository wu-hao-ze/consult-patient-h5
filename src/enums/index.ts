// 问诊类型
export enum ConsultType {
  Doctor = 1, // 找医生
  Fast = 2, // 极速问诊
  Medication = 3 // 开药问诊
}

// 问诊时间，以1自增可以省略
export enum IllnessTime {
  Week = 1, // 一周内
  Month, // 一个月内
  HalfYear, // 半年内
  More // 半年以上
}

// 订单状态，前面是问诊订单，后面是药品订单
export enum OrderType {
  ConsultPay = 1, // 待支付
  ConsultWait = 2, // 待接诊
  ConsultChat = 3, // 咨询中
  ConsultComplete = 4, // 已完成
  ConsultCancel = 5, // 已取消
  MedicinePay = 10, // 待支付
  MedicineSend = 11, // 待发货
  MedicineTake = 12, // 待收货
  MedicineComplete = 13, // 已完成
  MedicineCancel = 14 // 已取消
}

// 消息类型
export enum MsgType {
  MsgText = 1, // 文字
  MsgImage = 4, // 图片
  CardPat = 21, // 患者病情卡片
  CardPre = 22, // 处方信息卡片
  CardEvaForm = 23, // 未提交评价卡片
  CardEva = 24, // 已提交评价卡片
  Notify = 31, // 普通通知，白底黑字
  NotifyTip = 32, // 温馨提示
  NotifyCancel = 33 // 结束问诊通知，灰色底黑字
}

// 购买药品的状态
export enum PrescriptionStatus {
  NotPayment = 1, // 未付款
  Payment = 2, // 已付款
  Invalid = 3 // 已失效
}

// 物流状态
export enum ExpressStatus {
  Delivered = 1, // 已发货
  Received = 2, // 已揽件
  Transit = 3, // 运输中
  Delivery = 4, // 派送中
  Signed = 5 // 已签收
}
