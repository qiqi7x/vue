// 引入Vue中的ref函数
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
// 定义一个异步函数，用于获取预订信息
const fetchBookings = async () => {
  // 设置加载状态为true
  loading.value = true;
  // 设置错误状态为null
  error.value = null;
  try {
    // 发送请求，获取预订信息
    const response = await fetch('http://localhost:3001/bookings');
    // 将返回的json数据赋值给bookings
    bookings.value = await response.json();
  } catch (e) {
    // 如果发生错误，将错误赋值给error
    error.value = e;
  } finally {
    // 无论是否发生错误，都将加载状态设置为false
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
// 定义一个异步函数，用于处理注册事件
const handleRegistration = async (event) => {
  // 检查bookings数组中是否已经存在该用户的该事件
  if (bookings.value.some((booking) => booking.eventId === event.id && booking.userId === 1)) {
    // 如果存在，则弹出提示框，并返回
    alert('You are already registered for this event.');
    return;
  }

  // 创建一个新的booking对象
  const newBooking = {
    id: Date.now().toString(), // 使用当前时间戳作为id
    userId: 1, // 用户id为1
    eventId: event.id, // 事件id
    eventTitle: event.title, // 事件标题
    status: 'pending' // 状态为待确认
  };

  // 将新的booking对象添加到bookings数组中
  bookings.value.push(newBooking);

  try {
    // 向服务器发送POST请求，将新的booking对象发送到服务器
    const response = await fetch('http://localhost:3001/bookings', {
      method: 'POST', // 请求方法为POST
      headers: { 'Content-Type': 'application/json' }, // 请求头为application/json
      body: JSON.stringify({
        ...newBooking, // 将新的booking对象转换为JSON字符串
        status: 'confirmed' // 状态为已确认
      })
    });

// 如果响应成功
    if (response.ok) {
      // 根据新预订的id查找预订
      const index = findBookingById(newBooking.id);
      // 将预订替换为响应的json数据
      bookings.value[index] = await response.json();
    } else {
      // 如果响应失败，抛出错误
      throw new Error('Failed to confirm booking');
    }
  } catch (e) {
    // 如果发生错误，打印错误信息
    console.error(`Failed to register for event: `, e);
    // 从预订中过滤掉新预订的id
    bookings.value = bookings.value.filter((b) => b.id !== newBooking.id);
  }
};

/**
 * 取消预订的异步函数
 * 在本地状态中找到并移除对应的预订信息，然后尝试向服务器发送取消请求，如果取消失败则重新添加预订信息
 * @param {string} bookingId - 需要取消的预订的ID
 */
// 定义一个异步函数，用于取消预订
const cancelBooking = async (bookingId) => {
  // 根据预订ID找到预订的索引
  const index = findBookingById(bookingId);
  // 获取原始预订信息
  const originalBooking = bookings.value[index];
  // 从预订列表中删除该预订
  bookings.value.splice(index, 1);

  try {
    // 发送DELETE请求，取消预订
    const response = await fetch(`http://localhost:3001/bookings/${bookingId}`, {
      method: 'DELETE'
    });
    // 如果响应状态码不是200，抛出错误
    if (!response.ok) {
      throw new Error('Booking could not be cancelled.');
    }
  } catch (e) {
    // 如果发生错误，打印错误信息，并将原始预订信息重新添加到预订列表中
    console.error(`Failed to cancel booking:`, e);
    bookings.value.splice(index, 0, originalBooking);
  }
};

/**
 * 默认导出一个使用Vue的Composition API来管理预订相关功能的函数
 * @returns {Object} - 包含bookings数组、loading和error状态，以及fetchBookings、handleRegistration和cancelBooking函数的对象
 */
// 导出一个默认函数，用于处理预订
export default function useBookings() {
  // 返回一个对象，包含预订、加载状态、错误信息、获取预订、处理注册和取消预订的方法
  return {
    bookings,
    loading,
    error,
    fetchBookings,
    handleRegistration,
    cancelBooking
  };
}