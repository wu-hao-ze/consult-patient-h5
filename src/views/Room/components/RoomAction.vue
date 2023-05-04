<template>
  <div class="room-action">
    <van-field
      v-model="text"
      type="text"
      class="input"
      :border="false"
      placeholder="问医生"
      autocomplete="off"
      :disabled="disabled"
      @keyup.enter="sendText"
    ></van-field>
    <!-- preview-image控制是否在上传完成时展示预览图 -->
    <van-uploader
      :preview-image="false"
      :after-read="sendImage"
      :disabled="disabled"
    >
      <cp-icon name="consult-img" />
    </van-uploader>
  </div>
</template>

<script setup lang="ts">
import { uploadImage } from '@/services/consult'
import type { Image } from '@/types/consult'
import { Toast } from 'vant'
import type { UploaderAfterRead } from 'vant/lib/uploader/types'
import { ref } from 'vue'

defineProps<{
  disabled: boolean
}>()
const emit = defineEmits<{
  (e: 'send-text', text: string): void
  (e: 'send-image', img: Image): void
}>()

const text = ref('') // 输入的文字
const sendText = () => {
  emit('send-text', text.value) // 把输入的文字传给父组件index.vue
  text.value = '' // 然后清空输入框
}
const sendImage: UploaderAfterRead = async (item) => {
  if (Array.isArray(item)) return // 和之前的上传图片一样，因为没开启一次上传多张图片，所以data不会是文件数组
  if (!item.file) return
  const loading = Toast.loading('正在上传')
  const res = await uploadImage(item.file)
  loading.clear()
  emit('send-image', res.data) // 把上传的图片传给父组件index.vue
}
</script>

<style lang="scss" scoped>
.room-action {
  position: fixed;
  left: 0;
  bottom: 0;
  bottom: constant(safe-area-inset-bottom);
  bottom: env(safe-area-inset-bottom);
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 1;
  box-sizing: border-box;
  .input {
    background-color: var(--cp-bg);
    border: none;
    border-radius: 25px;
    margin-right: 10px;
    padding: 8px 15px;
  }
  .cp-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
