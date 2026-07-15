<template>
  <div class="order-manage-page">
    <h2>订单管理</h2>

    <el-table v-loading="loading" :data="orderList" border>
      <el-table-column prop="orderNo" label="订单号" min-width="180" />
      <el-table-column label="下单用户 ID" width="110">
        <template #default="{ row }">{{ row.userId }}</template>
      </el-table-column>
      <el-table-column label="商品数" width="90">
        <template #default="{ row }">{{ row.items.length }}</template>
      </el-table-column>
      <el-table-column label="实付金额" width="120">
        <template #default="{ row }">¥{{ row.payAmount.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="当前状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="下单时间" width="180" />
      <el-table-column label="修改状态" width="140">
        <template #default="{ row }">
          <el-select
            :model-value="row.status"
            size="small"
            @change="(val: OrderStatus) => handleStatusChange(row, val)"
          >
            <el-option label="待付款" value="pending" />
            <el-option label="已付款" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="router.push(`/order/${row.id}`)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAdminOrderList, updateOrderStatus } from '@/api/order'
import type { Order, OrderStatus } from '@/types/order'

const router = useRouter()
const orderList = ref<Order[]>([])
const loading = ref(false)

const statusMap: Record<OrderStatus, { text: string; type: 'warning' | 'success' | 'primary' | 'info' }> = {
  pending: { text: '待付款', type: 'warning' },
  paid: { text: '已付款', type: 'success' },
  shipped: { text: '已发货', type: 'primary' },
  completed: { text: '已完成', type: 'info' }
}

function statusText(status: OrderStatus) {
  return statusMap[status]?.text || status
}

function statusTagType(status: OrderStatus) {
  return statusMap[status]?.type || 'info'
}

async function fetchOrderList() {
  loading.value = true
  try {
    orderList.value = await getAdminOrderList()
  } finally {
    loading.value = false
  }
}

async function handleStatusChange(row: Order, status: OrderStatus) {
  await updateOrderStatus(row.id, status)
  row.status = status
  ElMessage.success('状态已更新')
}

onMounted(fetchOrderList)
</script>

<style scoped>
.order-manage-page {
  padding: 20px;
}

.order-manage-page h2 {
  margin-bottom: 16px;
}
</style>
