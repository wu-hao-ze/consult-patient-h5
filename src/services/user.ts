import type {
  CodeType,
  Patient,
  PatientList,
  User,
  UserInfo
} from '@/types/user'
import { request } from '@/utils/request'

// 密码登录
export const loginByPassword = (mobile: string, password: string) =>
  request<User>('/login/password', 'POST', { mobile, password })

// 发送验证码
export const sendMobileCode = (mobile: string, type: CodeType) =>
  // request后面的泛型是为了确定返回的数据类型，但我们不需要用返回的数据，只是在网络的响应中得到验证码，然后手动输入验证码到表单中
  request('/code', 'GET', { mobile, type })

// 短信验证码登录
export const loginByMobile = (mobile: string, code: string) =>
  request<User>('/login', 'POST', { mobile, code })

// 获取个人信息
export const getUserInfo = () => request<UserInfo>('/patient/myUser')

// 获取患者信息列表
export const getPatientList = () => request<PatientList>('/patient/mylist')

// 下面这三个请求都用不上响应回来的数据，所以不需要在request后面加泛型的类型
// 添加患者信息
export const addPatient = (patient: Patient) =>
  request('/patient/add', 'POST', patient)

// 编辑患者信息
export const editPatient = (patient: Patient) =>
  request('/patient/update', 'PUT', patient)

// 删除患者信息
export const delPatient = (id: string) =>
  request(`/patient/del/${id}`, 'DELETE')

// 根据患者id查询患者详情，用于问诊订单
export const getPatientDetail = (id: string) =>
  request<Patient>(`/patient/info/${id}`)

// qq登录
export const loginByQQ = (openId: string) =>
  request<User>('/login/thirdparty', 'POST', { openId, source: 'qq' }) // 给source指定默认值qq

// qq登录后的绑定手机号
export const bindMobile = (data: {
  mobile: string
  code: string
  openId: string
}) => request<User>('/login/binding', 'POST', data)
