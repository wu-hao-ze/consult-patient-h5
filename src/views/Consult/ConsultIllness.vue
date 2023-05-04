<template>
  <div class="consult-illness-page">
    <cp-nav-bar title="图文问诊" />
    <!-- 医生提示 -->
    <div class="illness-tip van-hairline--bottom">
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <div class="info">
        <p class="tit">在线医生</p>
        <p class="tip">
          请描述你的疾病或症状、是否用药、就诊经历，需要我听过什么样的帮助
        </p>
        <p class="safe">
          <cp-icon name="consult-safe" /><span>内容仅医生可见</span>
        </p>
      </div>
    </div>
    <!-- 表单 -->
    <div class="illness-form">
      <van-field
        type="textarea"
        rows="3"
        placeholder="请详细描述您的病情，病情描述不能为空"
        v-model="form.illnessDesc"
      ></van-field>
      <div class="item">
        <p>本次患病多久了？</p>
        <cp-radio-btn :options="timeOptions" v-model="form.illnessTime" />
      </div>
      <div class="item">
        <p>此次病情是否去医院就诊过？</p>
        <cp-radio-btn :options="flagOptions" v-model="form.consultFlag" />
      </div>
      <div class="illness-img">
        <!-- 使用van-uploader组件上传文件(这里是上传图片) -->
        <van-uploader
          :after-read="onAfterRead"
          @delete="onDeleteImg"
          v-model="fileList"
          max-count="9"
          :max-size="5 * 1024 * 1024"
          upload-icon="photo-o"
          upload-text="上传图片"
        ></van-uploader>
        <!-- 有图片就不显示提示 -->
        <p class="tip" v-if="!fileList.length">
          上传内容仅医生可见，最多9张图，最大5MB
        </p>
      </div>
      <!-- 前面的disabled是类名，后面的disabled是数值，true或false控制是否加上前面的类名 -->
      <van-button
        :class="{ disabled: disabled }"
        @click="next"
        type="primary"
        block
        round
        >下一步</van-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConsultIllness, Image } from '@/types/consult'
import { computed, onMounted, ref } from 'vue'
import { Dialog, Toast } from 'vant'
import { useConsultStore } from '@/stores'
import type {
  UploaderAfterRead,
  UploaderFileListItem
} from 'vant/lib/uploader/types'
import { uploadImage } from '@/services/consult'
import { useRouter } from 'vue-router'
import { timeOptions, flagOptions } from '@/utils/filter'

const store = useConsultStore()
const router = useRouter()
// 表单的数据
const form = ref<ConsultIllness>({
  illnessDesc: '',
  illnessTime: undefined,
  consultFlag: undefined,
  pictures: []
})

// 图片列表，用于和van-uploader组件双向绑定
const fileList = ref<Image[]>([])

// 选择完图片之后触发
// 在上面的结构中鼠标摸到:after-read可以得到函数的类型UploaderAfterRead
// item是文件或者是文件数组
const onAfterRead: UploaderAfterRead = (item) => {
  // 因为item的类型有两种，一个是文件一个是文件数组，一次上传一张图片就会得到文件
  // 开启上传多张图片之后，一次上传多张图片就会得到文件数组，所以要类型守卫排除文件数组的情况
  // 因为van-uploader默认是不开启多张图片一起上传的，但可以一个一个上传，最终上传的数量最大值为上面的max-count
  if (Array.isArray(item)) return
  if (!item.file) return
  // 开始上传，item有几个属性，status，message，url等
  item.status = 'uploading'
  item.message = '上传中...'
  // await的写法还得用try catch，所以这里也可以直接写.then和.catch
  uploadImage(item.file)
    .then((res) => {
      item.status = 'done'
      item.message = undefined
      item.url = res.data.url
      form.value.pictures?.push(res.data) // 把返回的数据加到pictures数组中
    })
    .catch(() => {
      item.status = 'failed'
      item.message = '上传失败'
    })
}
// 删除图片
// 注意item要有类型，函数形参不加类型会报错，上面onAfterRead的item不加是因为有UploaderAfterRead类型，会默认对item进行处理
// 这里因为鼠标摸到delete事件发现没有类型提示，所以要写item的类型，和上面onAfterRead的item的类型是一样的
const onDeleteImg = (item: UploaderFileListItem) => {
  // 把pictures里面的图片也要删掉
  form.value.pictures = form.value.pictures?.filter(
    (pic) => pic.url !== item.url
  )
}
// 控制按钮只有在添加过上面必填的三项之后才点亮
const disabled = computed(
  () =>
    !(
      form.value.illnessDesc &&
      form.value.illnessTime !== undefined &&
      form.value.consultFlag !== undefined
    )
)
// 校验并保存数据，跳转家庭档案并选择患者
const next = () => {
  if (!form.value.illnessDesc) return Toast('请输入病情描述')
  if (form.value.illnessTime === undefined) return Toast('请选择症状持续时间')
  if (form.value.consultFlag === undefined) return Toast('请选择是否已经就诊')
  store.setIllness(form.value)
  // 跳转家庭档案，需要根据 isChange 实现是否有选择患者的功能
  router.push('/user/patient?isChange=1')
}
// 回显数据
onMounted(() => {
  if (store.consult.illnessDesc) {
    // closeOnPopstate默认是true，回退时会自动关闭弹窗，但我们这里不希望它关闭，所以要设置为false
    Dialog.confirm({
      title: '温馨提示',
      message: '是否恢复您之前填写的病情信息呢？',
      confirmButtonColor: 'var(--cp-primary)',
      closeOnPopstate: false
    }).then(() => {
      // 如果点击确认
      const { illnessDesc, illnessTime, consultFlag, pictures } = store.consult
      form.value = { illnessDesc, illnessTime, consultFlag, pictures }
      // 图片回显，因为pictures可能是undefined，所以pictures类型为Image[]||undefined
      // 而fileList是Image[]类型，所以可以在pictures为undefined时添加一个|| []  赋值为空数组
      fileList.value = pictures || []
    })
  }
})
</script>

<style lang="scss" scoped>
.consult-illness-page {
  padding-top: 46px;
}
.illness-tip {
  display: flex;
  padding: 15px;
  .img {
    width: 52px;
    height: 52px;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
  }
  .info {
    flex: 1;
    padding-left: 12px;
    .tit {
      font-size: 16px;
      margin-bottom: 5px;
    }
    .tip {
      padding: 12px;
      background: var(--cp-bg);
      color: var(--cp-text3);
      font-size: 13px;
      margin-bottom: 10px;
    }
    .safe {
      font-size: 10px;
      color: var(--cp-text3);
      display: flex;
      align-items: center;
      .cp-icon {
        font-size: 12px;
        margin-right: 2px;
      }
    }
  }
}
.illness-form {
  padding: 15px;
  .van-field {
    padding: 0;
    &::after {
      border-bottom: none;
    }
  }
  .item {
    > p {
      color: var(--cp-text3);
      padding: 15px 0;
    }
  }
}
.illness-img {
  padding-top: 16px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  .tip {
    font-size: 12px;
    color: var(--cp-tip);
  }
  ::v-deep() {
    .van-uploader {
      &__preview {
        &-delete {
          left: -6px;
          top: -6px;
          border-radius: 50%;
          background-color: var(--cp-primary);
          width: 20px;
          height: 20px;
          &-icon {
            transform: scale(0.9) translate(-22%, 22%);
          }
        }
        &-image {
          border-radius: 8px;
          overflow: hidden;
        }
      }
      &__upload {
        border-radius: 8px;
      }
      &__upload-icon {
        color: var(--cp-text3);
      }
    }
  }
}
.van-button {
  font-size: 16px;
  margin-bottom: 30px;
  &.disabled {
    opacity: 1;
    background: #fafafa;
    color: #d9dbde;
    border: #fafafa;
  }
}
</style>
