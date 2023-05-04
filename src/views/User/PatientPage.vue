<template>
  <div class="patient-page">
    <cp-nav-bar :title="isChange ? '选择患者' : '家庭档案'" />
    <!-- 如果是选择患者页面，则显示头部提示 -->
    <div class="patient-change" v-if="isChange">
      <h3>请选择患者信息</h3>
      <p>以便医生给出更准确的治疗，信息仅医生可见</p>
    </div>
    <div class="patient-list">
      <div
        class="patient-item"
        v-for="item in list"
        :key="item.id"
        @click="selectedPatient(item)"
        :class="{ selected: patientId === item.id }"
      >
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <!-- 正则表达式，分两组，$1是第一组，$2是第二组 -->
          <span class="id">{{
            item.idCard.replace(/^(.{6}).+(.{4})$/, '$1******$2')
          }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <div @click.stop="showPopup(item)" class="icon">
          <cp-icon name="user-edit" />
        </div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <!-- 注意这里一定要写showPopup()而不是showPopup，如果不写括号则用形参接收会默认是事件对象，写括号则代表不传参数 -->
      <div class="patient-add" v-if="list.length < 6" @click="showPopup()">
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
    </div>
    <!-- 如果是选择患者的情况下，则需要显示下一步的按钮 -->
    <div class="patient-next" v-if="isChange">
      <van-button type="primary" @click="next" round block>下一步</van-button>
    </div>

    <!-- 侧滑栏 -->
    <van-popup v-model:show="show" position="right">
      <!-- 因为点navbar的返回就会直接router.back()，所以不会回到家庭档案，而是直接回到个人中心，但是目的是想回到家庭档案 -->
      <!-- 所以扩展cp-nav-bar组件，支持自定义返回，扩展 back 属性，如果有就执行 back 对应的函数，在cp-nav-bar组件中设置 -->
      <cp-nav-bar
        :back="() => (show = false)"
        :title="patient.id ? '编辑患者' : '添加患者'"
        right-text="保存"
        @click-right="submit"
      ></cp-nav-bar>
      <van-form autocomplete="off">
        <van-field
          v-model="patient.name"
          label="真实姓名"
          placeholder="请输入真实姓名"
          :rules="nameRules"
        />
        <van-field
          v-model="patient.idCard"
          label="身份证号"
          placeholder="请输入身份证号"
          :rules="idCardRules"
        />
        <van-field label="性别">
          <!-- input插槽是自定义输入框，使用此插槽后，与输入框相关的属性和事件将失效 -->
          <template #input>
            <!-- 单选按钮组件 -->
            <cp-radio-btn
              :options="options"
              v-model="patient.gender"
            ></cp-radio-btn>
          </template>
        </van-field>
        <van-field label="默认就诊人">
          <template #input>
            <van-checkbox round v-model="defaultFlag" />
          </template>
        </van-field>
      </van-form>
      <van-action-bar v-if="patient.id">
        <van-action-bar-button @click="remove">删除</van-action-bar-button>
      </van-action-bar>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import {
  addPatient,
  getPatientList,
  editPatient,
  delPatient
} from '@/services/user'
import type { Patient, PatientList } from '@/types/user'
import { Dialog, Toast, type FormInstance } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConsultStore } from '@/stores'
import { nameRules, idCardRules } from '@/utils/rules'

const route = useRoute()
const router = useRouter()
const store = useConsultStore()
// 通过计算属性判断isChange是否为1，如果为1则把isChange赋值为true，否则为false
// true代表是选择患者，false代表是家庭档案，注意地址栏拿下来的都是字符串类型
const isChange = computed(() => route.query?.isChange === '1')
// 用于记录患者id
const patientId = ref<string>()
const selectedPatient = (item: Patient) => {
  // 如果是在选择患者情况下，则需要点击之后记录患者id
  if (isChange.value) {
    patientId.value = item.id
  }
}
// 渲染家庭档案列表数据
const list = ref<PatientList>([])
const loadList = async () => {
  const res = await getPatientList()
  list.value = res.data
  // 在选择患者的情况下，且有患者信息的时候，设置默认选中的id
  if (isChange.value && list.value.length) {
    // defPatient是list数组中的默认就诊人的那个对象数据，如果有默认就诊人，则设置患者id为默认就诊人的id，如果没有，则设置第一个
    const defPatient = list.value.find((item) => item.defaultFlag === 1)
    if (defPatient) patientId.value = defPatient.id
    else patientId.value = list.value[0].id
  }
}
onMounted(() => {
  loadList()
})
// patient的初始化
const initPatient: Patient = {
  name: '',
  idCard: '',
  gender: 1,
  defaultFlag: 0
}
// 利用{ ...initPatient }重新拷贝一个新对象，而不影响initPatient这个初始化对象
const patient = ref<Patient>({ ...initPatient })
// 打开侧滑栏
const show = ref(false)
const showPopup = (item?: Patient) => {
  if (item) {
    // 如果是编辑患者，则需要回显数据
    const { id, gender, name, idCard, defaultFlag } = item
    patient.value = { id, gender, name, idCard, defaultFlag }
  } else {
    // 如果是添加患者，则需要重置表单，让表单为空，再重新添加患者信息
    patient.value = { ...initPatient }
  }
  show.value = true
}
// 提供单选按钮组件CpRadioBtn的可选项
const options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 }
]
// 默认值defaultFlag需要转换，因为checkbox的勾选是赋值为true或false，但defaultFlag的值想要的是0或1
// 利用计算属性，并且因为defaultFlag绑定在v-model上，意味着需要主动的改变计算属性的值，那么就需要使用计算属性的完整写法
// get是其他依赖项改变，自动重新更新计算属性的值
// set是主动修改计算属性的值，然后通过形参接收修改过后的值，并重新更改计算属性的依赖项的值，最后再反过来影响计算属性的值
const defaultFlag = computed({
  get() {
    return patient.value.defaultFlag === 1 ? true : false
  },
  set(value) {
    patient.value.defaultFlag = value ? 1 : 0
  }
})
// 保存信息
const form = ref<FormInstance>()
const submit = async () => {
  if (!patient.value.name) return Toast('请输入真实姓名')
  if (!patient.value.idCard) return Toast('请输入身份证号')
  await form.value?.validate()
  // 身份证倒数第二位，单数是男，双数是女，+可以直接将字符串转成数字
  const gender = +patient.value.idCard.slice(-2, -1) % 2
  if (gender !== patient.value.gender)
    return Toast('填写的性别和身份证号中的不一致')
  console.log('通过校验')
  // 编辑患者 & 添加患者
  patient.value.id
    ? await editPatient(patient.value)
    : await addPatient(patient.value)
  show.value = false
  loadList()
  Toast.success(patient.value.id ? '编辑成功' : '添加成功')
}
// 删除患者
const remove = async () => {
  // 类型守卫，防止下面的patient.value.id是undefined
  if (patient.value.id) {
    await Dialog.confirm({
      title: '温馨提示',
      message: `您确认要删除 ${patient.value.name} 患者信息吗 ？`,
      cancelButtonText: '取消',
      confirmButtonText: '确认'
    })
    await delPatient(patient.value.id)
    show.value = false
    loadList()
    Toast.success('删除成功')
  }
}
// 点击下一步按钮之后进行的操作
const next = async () => {
  if (!patientId.value) return Toast('请选择就诊患者')
  store.setPatient(patientId.value)
  router.push('/consult/pay')
}
</script>

<style lang="scss" scoped>
.patient-change {
  padding: 15px;
  > h3 {
    font-weight: normal;
    margin-bottom: 5px;
  }
  > p {
    color: var(--cp-text3);
  }
}
.patient-next {
  padding: 15px;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
}
// 底部操作栏
.van-action-bar {
  padding: 0 10px;
  margin-bottom: 10px;
  .van-button {
    color: var(--cp-price);
    background-color: var(--cp-bg);
  }
}
.patient-page {
  padding: 46px 0 80px;
  ::v-deep() {
    .van-popup {
      width: 100%;
      height: 100%;
      padding-top: 46px;
      box-sizing: border-box;
    }
    .van-checkbox__icon {
      font-size: 18px;
    }
  }
}
.patient-list {
  padding: 15px;
}
.patient-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--cp-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid var(--cp-bg);
  transition: all 0.3s;
  overflow: hidden;
  .info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    span {
      color: var(--cp-tip);
      margin-right: 20px;
      line-height: 30px;
      &.name {
        font-size: 16px;
        color: var(--cp-text1);
        width: 80px;
        margin-right: 0;
      }
      &.id {
        color: var(--cp-text2);
        width: 180px;
      }
    }
  }
  .icon {
    color: var(--cp-tag);
    width: 20px;
    text-align: center;
  }
  .tag {
    position: absolute;
    right: 60px;
    top: 21px;
    width: 30px;
    height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--cp-primary);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &.selected {
    border-color: var(--cp-primary);
    background-color: var(--cp-plain);
    .icon {
      color: var(--cp-primary);
    }
  }
}
.patient-add {
  background-color: var(--cp-bg);
  color: var(--cp-primary);
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;
  .cp-icon {
    font-size: 24px;
  }
}
.patient-tip {
  color: var(--cp-tag);
  padding: 12px 0;
}
</style>
