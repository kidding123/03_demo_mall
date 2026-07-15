<template>
  <div v-loading="loading" class="order-detail-page">
    <el-page-header content="订单详情" @back="router.back()" class="page-header" />

    <template v-if="order">
      <div class="section success-banner">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <div>
          <div class="success-title">下单成功</div>
          <div class="success-sub">订单号：{{ order.orderNo }}</div>
        </div>
      </div>

      <div class="section">
        <h3>收货地址</h3>
        <p>
          {{ order.address.name }} {{ order.address.phone }}
        </p>
        <p class="address-text">
          {{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}
        </p>
      </div>

      <div class="section">
        <h3>商品清单</h3>
        <el-table :data="order.items">
          <el-table-column label="商品" min-width="280">
            <template #default="{ row }">
              <div class="product-cell">
                <img :src="row.image" class="item-image" />
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="数量" width="100">
            <template #default="{ row }">x{{ row.quantity }}</template>
          </el-table-column>
        </el-table>
      </div>

      <div class="section total-section">
        <div>商品合计：¥{{ order.totalPrice.toFixed(2) }}</div>
        <div v-if="order.discountAmount > 0" class="discount-line">
          优惠：-¥{{ order.discountAmount.toFixed(2) }}
        </div>
        <div class="pay-line">
          实付：<b>¥{{ order.payAmount.toFixed(2) }}</b>
        </div>
      </div>

      <div class="action-row">
        <el-button @click="router.push('/order/list')">查看全部订单</el-button>
        <el-button type="primary" @click="router.push('/product')">继续购物</el-button>
      </div>
    </template>

    <el-empty v-else-if="!loading" description="订单不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { getOrderDetail } from '@/api/order'
import type { Order } from '@/types/order'

const route = useRoute()
const router = useRouter()

const order = ref<Order | null>(null)
const loading = ref(false)

async function fetchDetail() {
  loading.value = true
  try {
    const id = route.params.id as string
    order.value = await getOrderDetail(id)
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.order-detail-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.success-icon {
  font-size: 40px;
  color: #67c23a;
}

.success-title {
  font-size: 18px;
  font-weight: bold;
}

.success-sub {
  color: #999;
  margin-top: 4px;
}

.address-text {
  color: #666;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.total-section {
  text-align: right;
  color: #666;
  line-height: 1.8;
}

.discount-line {
  color: #f56c6c;
}

.pay-line b {
  color: #f56c6c;
  font-size: 22px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
