<template>
  <div class="order-logistics-page">
    <!-- 需要一个容器，类似echarts的那种，命名为map，下面使用地图的话也需要和这里的对应 -->
    <div id="map">
      <div class="title">
        <!-- 这里也可以不用useRouter导出的router，而直接使用$router(因为这里是组件，所以可以直接使用$router) -->
        <van-icon name="arrow-left" @click="router.back()" />
        <span>{{ logistics?.statusValue }}</span>
        <van-icon name="service" />
      </div>
      <div class="current">
        <p class="status">
          {{ logistics?.statusValue }}——预计{{ logistics?.estimatedTime }}
        </p>
        <p class="predict">
          <span>{{ logistics?.name }}</span>
          <span>{{ logistics?.awbNo }}</span>
        </p>
      </div>
    </div>
    <div class="logistics">
      <p class="title">物流详情</p>
      <!-- van-steps组件，active表示激活物流信息的哪一条 -->
      <van-steps direction="vertical" :active="0">
        <van-step v-for="item in logistics?.list" :key="item.id">
          <p class="status" v-if="item.statusValue">{{ item.statusValue }}</p>
          <p class="content">{{ item.content }}</p>
          <p class="time">{{ item.createTime }}</p>
        </van-step>
      </van-steps>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMedicalOrderLogistics } from '@/services/order'
import type { Logistics } from '@/types/order'
import carImg from '@/assets/car.png'
import startImg from '@/assets/start.png'
import endImg from '@/assets/end.png'
// 导入AMapLoader
import AMapLoader from '@amap/amap-jsapi-loader'

const route = useRoute()
const router = useRouter()
const logistics = ref<Logistics>() // 药品订单物流信息

// JSAPI key搭配静态安全密钥以明文设置(不安全，建议开发环境用)
// 注意这个设置必须是在JSAPI的脚本加载之前进行设置，否则设置无效
window._AMapSecurityConfig = {
  securityJsCode: '891564a7bb63066aa501a2df7518d733'
}
onMounted(async () => {
  // 获取药品订单物流信息
  const res = await getMedicalOrderLogistics(route.params.id as string)
  logistics.value = res.data

  // 下面是使用地图的固定用法，调用load
  AMapLoader.load({
    key: 'e17859ca39b5df32a6e2bed994f4c173', // 申请好的Web端开发者Key
    version: '2.0' // 指定要加载的 JSAPI 的版本
  })
    .then((AMap) => {
      // 使用AMap初始化地图，第一个参数是容器的id，也就是上面结构中的id为map
      const map = new AMap.Map('map', {
        mapStyle: 'amap://styles/macaron', // 地图样式
        zoom: 12 // 初始化地图级别(放大倍数)
      })
      // 驾车路线规划需要使用AMap.Driving插件
      // 参考文档：https://lbs.amap.com/api/javascript-api-v2/guide/services/navigation
      AMap.plugin('AMap.Driving', function () {
        // 初始化路线规划的实例对象
        const driving = new AMap.Driving({
          map: map, // map指定将路线规划方案绘制到对应的AMap.Map对象上，必须指定！
          showTraffic: false, // 是否展示道路拥堵情况
          hideMarkers: true // 关闭marker标记，隐藏路线上的覆盖物，并且下面要自己绘制覆盖物
        })
        // 使用药品订单物流信息中的经纬度数组中的第一个数据作为起始坐标，最后一个作为结束坐标
        // 之所以使用res.data不使用logistics.value，是因为logistics是ref初始化的数据，类型可能是undefined
        const start = res.data.logisticsInfo.shift()
        const end = res.data.logisticsInfo.pop()
        // 删除这两个元素之后，其余数组中的元素都是运输过程中的坐标，也是充当路径纠偏的坐标点

        // 绘制三个覆盖物，分别是起点，终点，当前运输到的位置
        // 覆盖物的用法：https://lbs.amap.com/api/javascript-api-v2/guide/map/map-layer
        // 通过new AMap.Marker把icon图标覆盖到指定位置position上，然后再在地图上add一下，即map.add
        // 起点覆盖物
        const marker1 = new AMap.Marker({
          position: [start?.longitude, start?.latitude],
          icon: startImg
        })
        map.add(marker1)
        // 终点覆盖物
        const marker2 = new AMap.Marker({
          position: [end?.longitude, end?.latitude],
          icon: endImg
        })
        map.add(marker2)
        // 路径搜索，第一个参数是起始点，第二个参数是结束点，第三个参数是路途中的经纬度坐标数组
        driving.search(
          [start?.longitude, start?.latitude],
          [end?.longitude, end?.latitude],
          {
            waypoints: res.data.logisticsInfo.map((item) => [
              item.longitude,
              item.latitude
            ])
          },
          (status: string, result: object) => {
            // 回调函数中是路线规划完毕要进行的操作
            console.log(status) // status为complete时，result为DrivingResult，status为error时，result为错误信息info
            console.log(result) // 未出错时，result即是对应的路线规划方案
            // 运输中的覆盖物，需要等路径出来之后才显示的，所以放到回调函数里
            const marker = new AMap.Marker({
              icon: carImg,
              position: [
                res.data.currentLocationInfo.longitude,
                res.data.currentLocationInfo.latitude
              ],
              anchor: 'center' // 控制覆盖物放在轨迹中的位置
            })
            map.add(marker)
            // 3s后定位到运输位置中心，进行缩放
            setTimeout(() => {
              map.setFitView([marker]) // 自适应多个点位
              map.setZoom(14) // 设置地图缩放级别
            }, 3000)
          }
        )
      })
    })
    .catch((e) => {
      console.log(e)
    })
})
</script>

<style lang="scss" scoped>
.order-logistics-page {
  --van-step-icon-size: 18px;
  --van-step-circle-size: 10px;
}
#map {
  height: 450px;
  background-color: var(--cp-bg);
  overflow: hidden;
  position: relative;
  .title {
    background-color: #fff;
    height: 46px;
    width: 355px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    font-size: 16px;
    position: absolute;
    left: 10px;
    top: 10px;
    box-sizing: border-box;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    > span {
      flex: 1;
      text-align: center;
    }
    .van-icon {
      font-size: 18px;
      color: #666;
      &:last-child {
        color: var(--cp-primary);
      }
    }
  }
  .current {
    height: 80px;
    border-radius: 4px;
    background-color: #fff;
    height: 80px;
    width: 355px;
    box-sizing: border-box;
    padding: 15px;
    position: absolute;
    left: 10px;
    bottom: 10px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    .status {
      font-size: 15px;
      line-height: 26px;
    }
    .predict {
      color: var(--cp-tip);
      font-size: 13px;
      margin-top: 5px;
      > span {
        padding-right: 10px;
      }
    }
  }
}
.logistics {
  padding: 0 10px 20px;
  .title {
    font-size: 16px;
    padding: 15px 5px 5px;
  }
  .van-steps {
    :deep(.van-step) {
      &::after {
        display: none;
      }
    }
    .status {
      font-size: 15px;
      color: var(--cp-text3);
      margin-bottom: 4px;
    }
    .content {
      font-size: 13px;
      color: var(--cp-tip);
      margin-bottom: 4px;
    }
    .time {
      font-size: 13px;
      color: var(--cp-tag);
    }
  }
}
</style>
