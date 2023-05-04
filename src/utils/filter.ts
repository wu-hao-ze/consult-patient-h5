import { IllnessTime } from '@/enums'

// 用于单选按钮选择时间
export const timeOptions = [
  { label: '一周内', value: IllnessTime.Week },
  { label: '一月内', value: IllnessTime.Month },
  { label: '半年内', value: IllnessTime.HalfYear },
  { label: '大于半年', value: IllnessTime.More }
]
// 用于单选按钮是否就诊过
export const flagOptions = [
  { label: '就诊过', value: 0 },
  { label: '没就诊过', value: 1 }
]
// 后台返回的数据，通过枚举类型来实义化，这里的time实际上是1/2/3/4
// 根据time的值来获取上面字符串的时间描述，也就是一周内/一月内等
export const getIllnessTimeText = (time: IllnessTime) =>
  timeOptions.find((item) => item.value === time)?.label
// 根据布尔值来获取上面字符串的是否就诊过
export const getConsultFlagText = (flag: 0 | 1) =>
  flagOptions.find((item) => item.value === flag)?.label
