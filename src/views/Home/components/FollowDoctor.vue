<template>
  <div class="follow-doctor">
    <div className="head">
      <p>推荐关注</p>
      <a href="javascript:;"> 查看更多<i class="van-icon van-icon-arrow" /></a>
    </div>
    <div class="body">
      <!-- 关掉循环，关掉指示器，设置宽度，使得一次滚动一个卡片 -->
      <!-- 注意这里设置宽度不能写死，因为这是js代码是不会被postcss-px-to-viewport适配的，所以要利用@vueuse/core组合api库 -->
      <van-swipe
        :width="(150 / 375) * width"
        :show-indicators="false"
        :loop="false"
      >
        <van-swipe-item v-for="item in list" :key="item.id">
          <!-- 医生卡片 -->
          <doctor-card :item="item" />
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDoctorPage } from '@/services/consult'
import type { DoctorList } from '@/types/consult'
import { useWindowSize } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import DoctorCard from './DoctorCard.vue'

// 可以自己实现，利用window.innerWidth获取当前屏幕宽度，利用window的resize事件，当页面宽度尺寸发生变化时就重新设置宽度
// 然后在onMounted中使用window.addEventListener('resize', ()=> width.value=(150 / 375) * window.innerwidth)
// 在onUnmounted中使用window.removeEventListener('resize', ()=> width.value=(150 / 375) * window.innerwidth)

// 可以利用vueuse函数库中的组合式api来实现
const { width } = useWindowSize()
const list = ref<DoctorList>()
const loadData = async () => {
  const res = await getDoctorPage({ current: 1, pageSize: 5 })
  list.value = res.data.rows
}
onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.follow-doctor {
  background-color: var(--cp-bg);
  height: 250px;
  .head {
    display: flex;
    justify-content: space-between;
    height: 45px;
    align-items: center;
    padding: 0 15px;
    font-size: 13px;
    > a {
      color: var(--cp-tip);
    }
  }
  .body {
    width: 100%;
    overflow: hidden;
  }
}
.doctor-card {
  width: 135px;
  height: 190px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 11px 0px rgba(229, 229, 229, 0.2);
  text-align: center;
  padding: 15px;
  margin-left: 15px;
  display: inline-block;
  box-sizing: border-box;
  > .van-image {
    width: 58px;
    height: 58px;
    vertical-align: top;
    border-radius: 50%;
    margin: 0 auto 8px;
  }
  > p {
    margin-bottom: 0;
    font-size: 11px;
    color: var(--cp-tip);
    &.name {
      font-size: 13px;
      color: var(--cp-text1);
      margin-bottom: 5px;
    }
  }
  > .van-button {
    padding: 0 12px;
    height: 28px;
    margin-top: 8px;
    width: 72px;
  }
}
</style>
