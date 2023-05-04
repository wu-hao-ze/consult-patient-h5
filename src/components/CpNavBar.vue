<template>
  <van-nav-bar
    fixed
    :title="title"
    left-arrow
    @click-left="onClickLeft"
    :right-text="rightText"
    @click-right="onClickRight"
  ></van-nav-bar>
</template>

<script setup lang="ts">
// 以前在组件中使用路由实例可以用this.$router，但是vue3中不能使用this，可以用useRouter来获取router对象，等价于之前的this.$router
// 但是注意，可以在模板中使用$router，在script中不能用的原因是不能用this，因为setup中还没有数据，拿不到组件实例
import { useRouter } from 'vue-router'
const router = useRouter()

// 点击右侧按钮，但不确定具体事件是什么，所以给一个emit就可以了，具体的实现是在使用本组件的时候通过click-right的事件处理函数
// 过程是：当点击右侧按钮时，触发本组件的click-right事件，调用onClickRight事件处理函数，执行emit('click-right')
// 然后在使用本组件的地方，通过cp-nav-bar标签上的click-right事件接收，此时调用它上面的事件处理函数
const emit = defineEmits<{
  (e: 'click-right'): void
}>()
const onClickRight = () => {
  emit('click-right')
}

// 自定义属性的接收
const props = defineProps<{
  title?: string
  rightText?: string
  back?: () => void // back属性的接受值是一个函数
}>()

// 实现点击返回按钮，返回上一个页面
const onClickLeft = () => {
  // 如果有传来的back函数，则返回按钮执行传来的back函数，而不是router.back()
  if (props.back) {
    return props.back()
  }
  // 判断是否有上一次的历史记录，如果有当前网站的上一个历史记录，可以执行back返回，否则跳转首页
  // 因为会遇到一种情况就是新开了一个网页，然后输入一个页面，这时实际上是没有当前网站的历史记录的，但是浏览器有缓存，就可以返回
  // 这个时候是不希望返回的，因为可能会返回到一个不确定的页面，所以要指定首页，可以用history.state?.back来判断是否可以回退
  if (history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style lang="scss" scoped>
// 因为修改的不是本组件的样式，而是修改的van-nav-bar组件下的样式，所以要用到深度作用选择器
// ::v-deep(){}这个选择器的里面全都不带scoped的自定义属性
::v-deep() {
  .van-nav-bar {
    // &代表当前选择器，所以下面这个实际上是.van-nav-bar__arrow
    &__arrow {
      font-size: 18px;
      color: var(--cp-text1);
    }
    &__text {
      font-size: 15px;
    }
  }
}
</style>
