<template>
  <!-- 使用svg标签，指定use标签的href属性为#icon-文件夹名称-图片名称，从而使用svg图标 -->
  <!-- 这里name是传来的值，指定的时候直接指定为文件夹名称-图片名称，所以就只用一个name接收就可以 -->
  <svg aria-hidden="true" class="cp-icon">
    <use :href="`#icon-${name}`" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<style lang="scss" scoped>
.cp-icon {
  // 通过em来设置和字体一样大
  width: 1em;
  height: 1em;
}
</style>
