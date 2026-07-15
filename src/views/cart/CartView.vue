<template>
  <div class="cart-page">
    <h2>我的购物车</h2>

    <el-empty v-if="cartStore.items.length === 0" description="购物车还是空的，快去逛逛吧">
      <el-button type="primary" @click="router.push('/product')">去购物</el-button>
    </el-empty>

    <div v-else class="cart-content">
      <el-table :data="cartStore.items" class="cart-table">
        <el-table-column width="60">
          <template #header>
            <el-checkbox
              :model-value="allChecked"
              @change="(val: boolean) => cartStore.toggleAllChecked(val)"
            />
          </template>
          <template #default="{ row }">
            <el-checkbox
              :model-value="row.checked"
              @change="() => cartStore.toggleChecked(row.id)"
            />
          </template>
        </el-table-column>

        <el-table-column label="商品" min-width="280">
          <template #default="{ row }">
            <div class="product-cell">
              <img :src="row.image" class="cart-image" />
              <span class="cart-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="单价" width="120">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>

        <el-table-column label="数量" width="160">
          <template #default="{ row }">
            <el-input-number
              :model-value="row.quantity"
              :min="1"
              :max="row.stock"
              size="small"
              @change="(val: number) => cartStore.updateQuantity(row.id, val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            <span class="subtotal">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" link @click="cartStore.removeItem(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部结算栏 -->
      <div class="checkout-bar">
        <span>已选 {{ cartStore.checkedCount }} 件商品</span>
        <span class="total-price">
          合计：<b>¥{{ cartStore.checkedTotalPrice.toFixed(2) }}</b>
        </span>
        <el-button
          type="danger"
          size="large"
          :disabled="cartStore.checkedCount === 0"
          @click="router.push('/checkout')"
        >
          结算
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'

const router = useRouter()
const cartStore = useCartStore()

const allChecked = computed(
  () => cartStore.items.length > 0 && cartStore.items.every((item) => item.checked)
)
</script>

<style scoped>
.cart-page {
  padding: 20px;
}

.cart-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.cart-table {
  margin-bottom: 20px;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.cart-name {
  font-size: 14px;
}

.subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.checkout-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.total-price {
  font-size: 16px;
}

.total-price b {
  color: #f56c6c;
  font-size: 22px;
}
</style>
