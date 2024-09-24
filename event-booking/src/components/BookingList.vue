<template>
  <!-- 如果有错误，则显示错误卡片 -->
  <template v-if="error">
    <ErrorCard :retry="fetchBookings">Failed to fetch bookings.</ErrorCard>
  </template>
  <!-- 否则，显示预订列表 -->
  <template v-else>
    <section class="grid grid-cols-1 gap-4">
      <!-- 如果正在加载，则显示加载中的预订项 -->
      <template v-if="!loading">
        <BookingItem
          v-for="booking in bookings"
          :key="booking.id"
          :title="booking.eventTitle"
          :status="booking.status"
          @cancelled="cancelBooking(booking.id)"
        />
      </template>
      <!-- 否则，显示4个加载中的预订项 -->
      <template v-else>
        <LoadingBookingItem v-for="i in 4" :key="i" />
      </template>
    </section>
  </template>
</template>

<script setup>
import { onMounted } from 'vue';
import LoadingBookingItem from '@/components/LoadingBookingItem.vue';
import BookingItem from '@/components/BookingItem.vue';
import useBookings from '@/composables/useBookings';
import ErrorCard from '@/components/ErrorCard.vue';

// 使用useBookings获取预订信息
const { bookings, loading, error, fetchBookings, cancelBooking } = useBookings();

// 在组件挂载时，获取预订信息
onMounted(() => {
  fetchBookings();
});
</script>
