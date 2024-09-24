<template>
  <!-- 如果有错误，则显示错误卡片 -->
  <template v-if="error">
    <ErrorCard :retry="fetchEvents"
      >Could not load events at the moment. Please try again.</ErrorCard
    >
  </template>
  <!-- 否则，显示事件列表 -->
  <template v-else>
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 如果没有加载中，则显示事件列表 -->
      <template v-if="!loading">
        <!-- 如果有事件，则显示事件卡片 -->
        <template v-if="events.length">
          <EventCard
            v-for="event in events"
            :key="event.id"
            :title="event.title"
            :when="event.date"
            :description="event.description"
            @register="handleRegistration(event)"
          />
        </template>
        <!-- 如果没有事件，则显示提示信息 -->
        <template v-else>
          <div class="col-span-2 text-center text-gray-500">No events yet.</div>
        </template>
      </template>
      <!-- 如果正在加载中，则显示加载卡片 -->
      <template v-else>
        <LoadingEventCard v-for="i in 4" :key="i" />
      </template>
    </section>
  </template>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import EventCard from '@/components/EventCard.vue';
import LoadingEventCard from '@/components/LoadingEventCard.vue';
import ErrorCard from '@/components/ErrorCard.vue';
import useBookings from '@/composables/useBookings';

// 获取注册事件的方法
const { handleRegistration } = useBookings();

// 定义事件列表、加载状态和错误状态
const events = ref([]);
const loading = ref(false);
const error = ref(null);

// 获取事件列表的方法
const fetchEvents = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('http://localhost:3001/events');
    events.value = await response.json();
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
};

// 在组件挂载时获取事件列表
onMounted(() => fetchEvents());
</script>
