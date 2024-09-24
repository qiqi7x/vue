// 引入Vue中的ref函数
import { ref } from 'vue';

// 定义一个用于存储预订信息的响应式数组
const bookings = ref([]);
// 定义一个用于指示数据加载状态的响应式变量
const loading = ref(false);
// 定义一个用于存储错误信息的响应式变量，初始值为null
const error = ref(null);


// 定义一个异步函数fetchBookings
const fetchBookings = async () => {
  // 设置加载状态为true
  loading.value = true;
  // 设置错误状态为null
  error.value = null;
  try {
    // 发送请求，获取虚拟数据
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
 * 根据ID查找信息的函数
 * @param {string} id - 需要查找ID
 * @returns {number} - 预订信息在数组中的索引，如果未找到则返回-1
 */
// 根据id查找
const findBookingById = (id) => bookings.value.findIndex((b) => b.id === id);

/**
 * @param {Object} event - 活动对象，包含活动ID和标题
 */
// 定义一个异步函数，用于处理按钮事件
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
    // 向服务器发送POST请求，将新的booking对象添加到db.json的bookings对象中
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
      // 根据id查找
      const index = findBookingById(newBooking.id);
      // 将数据替换为响应的json数据
      bookings.value[index] = await response.json();
    } else {
      // 如果响应失败，抛出错误
      throw new Error('Failed to confirm booking');
    }
  } catch (e) {
    // 如果发生错误，打印错误信息
    console.error(`Failed to register for event: `, e);
    // 从获得的信息中过滤掉新产生的id
    bookings.value = bookings.value.filter((b) => b.id !== newBooking.id);
  }
};

/**
 * @param {string} bookingId - 需要取消的ID
 */
// 定义一个异步函数，用于取消操作
const cancelBooking = async (bookingId) => {
  // 根据ID找到索引
  const index = findBookingById(bookingId);
  // 获取原始信息
  const originalBooking = bookings.value[index];
  // 从列表中删除该项
  bookings.value.splice(index, 1);

  try {
    // 发送DELETE请求，取消数据
    const response = await fetch(`http://localhost:3001/bookings/${bookingId}`, {
      method: 'DELETE'
    });
    // 如果响应状态码不是200，抛出错误
    if (!response.ok) {
      throw new Error('Booking could not be cancelled.');
    }
  } catch (e) {
    // 如果发生错误，打印错误信息，并将原始信息重新添加到列表中
    console.error(`Failed to cancel booking:`, e);
    bookings.value.splice(index, 0, originalBooking);
  }
};

/**
 * 默认导出一个使用Vue的Composition API来管理相关功能的函数
 * @returns {Object} - 包含bookings数组、loading和error状态，以及fetchBookings、handleRegistration和cancelBooking函数的对象
 */
// 导出一个默认函数，用于处理操作
export default function useBookings() {
  // 返回一个对象，包含bookings、loading、error、fetchBookings、handleRegistration和cancelBooking的方法
  return {
    bookings,
    loading,
    error,
    fetchBookings,
    handleRegistration,
    cancelBooking
  };
}