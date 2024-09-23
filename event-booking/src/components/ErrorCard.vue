<template>
  <!-- 定义一个SectionCard组件 -->
  <SectionCard>
    <!-- 定义一个div，设置间距、居中对齐、垂直排列 -->
    <div class="space-y-4 items-center flex flex-col">
      <!-- 定义一个div，设置文本颜色为红色 -->
      <div class="text-red-500">
        <!-- 使用slot插槽，可以插入其他内容 -->
        <slot />
      </div>
      <!-- 如果retry存在，则显示一个RoundButton按钮，点击时调用retry方法 -->
      <RoundButton @click="retry" v-if="retry">Retry now</RoundButton>
    </div>
  </SectionCard>
</template>

<script setup>
// 引入SectionCard组件
import SectionCard from '@/components/SectionCard.vue';
// 引入RoundButton组件
import RoundButton from './RoundButton.vue';
// 定义props，retry为函数类型，非必需
defineProps({
  retry: {
    type: Function,
    required: false
  }
});
</script>
