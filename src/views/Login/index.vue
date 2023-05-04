<template>
  <div class="login-page">
    <!-- 头部 -->
    <!-- <cp-nav-bar @click-right="$router.push('/register')"></cp-nav-bar> -->
    <!-- 次级头部 -->
    <div class="login-head">
      <h3>{{ isPass ? '密码登录' : '短信验证码登录' }}</h3>
      <a href="javascript:;" @click="isPass = !isPass">
        <span>{{ !isPass ? '密码登录' : '短信验证码登录' }}</span>
        <van-icon name="arrow"></van-icon>
      </a>
    </div>
    <!-- 表单 -->
    <van-form autocomplete="off" @submit="login" ref="form">
      <!-- name作为提交表单时校验的标识符，与form的validate方法配合 -->
      <van-field
        v-model="mobile"
        name="mobile"
        :rules="mobileRules"
        placeholder="请输入手机号"
        type="tel"
      ></van-field>
      <van-field
        v-if="isPass"
        v-model="password"
        :rules="passwordRules"
        placeholder="请输入密码"
        :type="show ? 'text' : 'password'"
      >
        <template #button>
          <cp-icon
            @click="show = !show"
            :name="`login-eye-${show ? 'on' : 'off'}`"
          ></cp-icon>
        </template>
      </van-field>
      <van-field
        v-else
        v-model="code"
        :rules="codeRules"
        placeholder="短信验证码"
      >
        <template #button>
          <span class="btn-send" :class="{ active: time > 0 }" @click="send">
            {{ time > 0 ? `${time}s后再次发送` : '发送验证码' }}
          </span>
        </template>
      </van-field>
      <!-- 复选框一栏 -->
      <div class="cp-cell">
        <van-checkbox v-model="agree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          <span>及</span>
          <a href="javascript:;">隐私条款</a>
        </van-checkbox>
      </div>
      <!-- 登录按钮，submit用于提交表单 -->
      <div class="cp-cell">
        <van-button block round type="primary" native-type="submit">
          登 录
        </van-button>
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码？</a>
      </div>
    </van-form>
    <!-- qq登录 -->
    <div class="login-other">
      <van-divider>第三方登录</van-divider>
      <div class="icon">
        <!-- 不像下面直接登录，可以route.query.returnUrl然后直接跳转，这个qq登录需要先跳转到qqUrl，那么就需要先保存 -->
        <!-- 利用store，保存returnUrl -->
        <a
          @click="store.setReturnUrl($route.query.returnUrl as string)"
          :href="qqUrl"
        >
          <img src="@/assets/qq.svg" alt="" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Toast } from 'vant'
import { ref } from 'vue'
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
import { loginByPassword, loginByMobile } from '@/services/user'
import { useUserStore } from '@/stores'
// 不能用this.$route，但可以用useRoute()来使用route
import { useRoute, useRouter } from 'vue-router'
import { useSendMobileCode } from '@/composable'

const mobile = ref('13230000001') // 手机号
const password = ref('abc12345') // 密码
const show = ref(false) // 眼睛图标的切换
const agree = ref(false) // 复选框按钮的勾选
const isPass = ref(true) // 实现密码登录和短信登录切换
const code = ref('') // 验证码

const store = useUserStore()
const router = useRouter()
const route = useRoute()
// 从发送短信验证码的函数导出表单form，倒计时time，发送验证码的函数send
const { form, time, send } = useSendMobileCode(mobile, 'login')

// 点击提交按钮之后，如果表单校验通过就会触发表单的submit事件，执行事件处理函数，这个login是设置的事件处理函数
const login = async () => {
  if (!agree.value) return Toast('请勾选我已同意')
  const res = isPass.value
    ? await loginByPassword(mobile.value, password.value)
    : await loginByMobile(mobile.value, code.value)
  store.setUser(res.data)
  // 在request.ts中对于token失效的情况进行了处理，通过router.currentRoute.value.fullPath记录了之前保留的页面的地址并跳转到登录
  // 所以在登录页面需要判断url地址栏上是否有returnUrl查询参数，如果有，就跳转到对应的位置，没有就跳转到首页
  // 使用replace而不使用push，是因为不想保存本次登录页的记录，而是直接替换掉记录，以免再次返回时又回到登录页
  router.replace((route.query.returnUrl as string) || '/home')
  // 使用类型断言，把LocationQueryValue[]类型指定成更具体的string
  Toast.success('登录成功')
}

// 点击第三方qq登录的按钮之后，跳转到的地址，绑定在上面的a标签上
// encodeURIComponent(url地址)可以将地址转码，比如://汉字等都可以转成%的形式
const qqUrl = `https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=${encodeURIComponent(
  'http://consult-patients.itheima.net/login/callback'
  // import.meta.env.VITE_APP_CALLBACK + '/login/callback'
  // 这里因为http://localhost:80/login/callback 不是合规的域名，不能用在qq登录中
  // 所以这里直接写合规的地址了，但实际上已经脱离这个项目了
)}`
</script>

<style lang="scss" scoped>
@import '@/styles/login.scss';
</style>
