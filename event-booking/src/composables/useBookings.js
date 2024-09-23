import { ref } from 'vue';

// 定义一个用于存储预订信息的响应式数组
const bookings = ref([]);
// 定义一个用于指示数据加载状态的响应式变量
const loading = ref(false);
// 定义一个用于存储错误信息的响应式变量，初始值为null
const error = ref(null);

/**
 * 异步获取预订信息的函数
 * 通过设置loading状态表示数据加载开始，尝试从服务器获取预订数据，成功则更新bookings数组，失败则记录错误信息，最终重置loading状态
 */
const fetchBookings = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('http://localhost:3001/bookings');
    bookings.value = await response.json();
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
};

/**
 * 根据ID查找预订信息的函数
 * @param {string} id - 需要查找的预订信息的ID
 * @returns {number} - 预订信息在数组中的索引，如果未找到则返回-1
 */
const findBookingById = (id) => bookings.value.findIndex((b) => b.id === id);

/**
 * 处理活动注册的异步函数
 * 检查是否已存在相同活动和用户的预订，如果不存在则创建新的预订，更新本地状态并尝试向服务器发送注册请求，成功则更新预订状态，失败则移除新创建的预订
 * @param {Object} event - 活动对象，包含活动ID和标题
 */
const handleRegistration = async (event) => {
  if (bookings.value.some((booking) => booking.eventId === event.id && booking.userId === 1)) {
    alert('You are already registered for this event.');
    return;
  }

  const newBooking = {
    id: Date.now().toString(),
    userId: 1,
    eventId: event.id,
    eventTitle: event.title,
    status: 'pending'
  };

  bookings.value.push(newBooking);

  try {
    const response = await fetch('http://localhost:3001/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newBooking,
        status: 'confirmed'
      })
    });

    if (response.ok) {
      const index = findBookingById(newBooking.id);
      bookings.value[index] = await response.json();
    } else {
      throw new Error('Failed to confirm booking');
    }
  } catch (e) {
    console.error(`Failed to register for event: `, e);
    bookings.value = bookings.value.filter((b) => b.id !== newBooking.id);
  }
};

/**
 * 取消预订的异步函数
 * 在本地状态中找到并移除对应的预订信息，然后尝试向服务器发送取消请求，如果取消失败则重新添加预订信息
 * @param {string} bookingId - 需要取消的预订的ID
 */
const cancelBooking = async (bookingId) => {
  const index = findBookingById(bookingId);
  const originalBooking = bookings.value[index];
  bookings.value.splice(index, 1);

  try {
    const response = await fetch(`http://localhost:3001/bookings/${bookingId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Booking could not be cancelled.');
    }
  } catch (e) {
    console.error(`Failed to cancel booking:`, e);
    bookings.value.splice(index, 0, originalBooking);
  }
};

/**
 * 默认导出一个使用Vue的Composition API来管理预订相关功能的函数
 * @returns {Object} - 包含bookings数组、loading和error状态，以及fetchBookings、handleRegistration和cancelBooking函数的对象
 */
export default function useBookings() {
  return {
    bookings,
    loading,
    error,
    fetchBookings,
    handleRegistration,
    cancelBooking
  };
}