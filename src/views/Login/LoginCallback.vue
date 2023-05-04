<template>
  <div class="login-page" v-if="!isBind">
    <cp-nav-bar></cp-nav-bar>
    <div class="login-head">
      <h3>手机绑定</h3>
    </div>
    <van-form autocomplete="off" @submit="bind" ref="form">
      <van-field
        v-model="mobile"
        name="mobile"
        :rules="mobileRules"
        placeholder="请输入手机号"
      ></van-field>
      <van-field
        v-model="code"
        name="code"
        :rules="codeRules"
        placeholder="请输入验证码"
      >
        <template #button>
          <span class="btn-send" :class="{ active: time > 0 }" @click="send">
            {{ time > 0 ? `${time}s后再次发送` : '发送验证码' }}
          </span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-button block round type="primary" native-type="submit">
          立即绑定
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { bindMobile, loginByQQ } from '@/services/user'
import { useUserStore } from '@/stores'
import { Toast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mobileRules, codeRules } from '@/utils/rules'
import { useSendMobileCode } from '@/composable'
import type { User } from '@/types/user'

const store = useUserStore()
const router = useRouter()

const isBind = ref(true) // 绑定手机页面的显示和隐藏
const openId = ref('') // openId

// 登录成功之后的操作
const loginSuccess = (res: { data: User }) => {
  store.setUser(res.data) // 存储返回的个人信息
  router.replace(store.returnUrl || '/home') // 如果有回跳地址就进行回跳，没有就跳转到首页
  Toast.success('登录成功')
  store.setReturnUrl('')
}

const mobile = ref('') // 手机号
const code = ref('') // 验证码

// 根据手机号发送验证码，验证码没法真正发到手机上查看，而是直接到网络中查看响应回来的验证码，通过v-model来改变code的值
const { form, time, send } = useSendMobileCode(mobile, 'bindMobile')

// 点击立即绑定之后触发
const bind = async () => {
  const res = await bindMobile({
    mobile: mobile.value,
    code: code.value,
    openId: openId.value
  })
  loginSuccess(res)
}

onMounted(() => {
  // 利用QC.Login.check()检查是否qq登录授权成功
  if (window.QC.Login.check()) {
    // 利用QC.Login.getMe((openId)=>{})拿到openId，getMe会自动执行里面的函数，并且该函数里面的形参直接就是openId
    window.QC.Login.getMe((id) => {
      openId.value = id
      // QQ登录
      loginByQQ(id)
        .then((res) => {
          // 绑定过手机，则登录成功
          loginSuccess(res)
        })
        .catch(() => {
          // 没绑定过手机，则登录失败，并且弹出绑定手机页面
          isBind.value = false
        })
    })
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/login.scss';
</style>
