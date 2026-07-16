<template>
  <div v-loading="loading" class="checkout-page">
    <el-page-header content="确认订单" @back="router.back()" class="page-header" />

    <el-empty v-if="cartStore.checkedItems.length === 0 && !loading" description="没有可结算的商品">
      <el-button type="primary" @click="router.push('/cart')">返回购物车</el-button>
    </el-empty>

    <template v-else>
      <!-- 收货地址 -->
      <div class="section">
        <div class="section-header">
          <h3>收货地址</h3>
          <el-link type="primary" @click="router.push('/address')">管理地址</el-link>
        </div>

        <el-empty v-if="addressList.length === 0" description="还没有收货地址" :image-size="60">
          <el-button type="primary" @click="router.push('/address')">去添加地址</el-button>
        </el-empty>

        <el-radio-group v-else v-model="selectedAddressId" class="address-list">
          <el-radio
            v-for="addr in addressList"
            :key="addr.id"
            :label="addr.id"
            class="address-item"
            border
          >
            <div class="address-content">
              <div class="address-top">
                <span class="address-name">{{ addr.name }}</span>
                <span class="address-phone">{{ addr.phone }}</span>
                <el-tag v-if="addr.isDefault" size="small" type="success">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
              </div>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 商品清单 -->
      <div class="section">
        <h3>商品清单</h3>
        <el-table :data="cartStore.checkedItems">
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
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              ¥{{ (row.price * row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 优惠券 -->
      <div class="section">
        <h3>优惠券</h3>
        <el-radio-group v-model="selectedUserCouponId" class="coupon-select">
          <el-radio :label="null">不使用优惠券</el-radio>
          <el-radio v-for="uc in usableCoupons" :key="uc.id" :label="uc.id">
            {{ uc.coupon.name }}
            <span class="coupon-hint">（{{ uc.coupon.description }}）</span>
          </el-radio>
        </el-radio-group>
        <div v-if="usableCoupons.length === 0" class="no-coupon-hint">
          暂无可用优惠券，去
          <el-link type="primary" @click="router.push('/coupon')">领券中心</el-link>
          看看
        </div>
      </div>

      <!-- 提交栏 -->
      <div class="submit-bar">
        <div class="price-detail">
          <div>商品合计：¥{{ cartStore.checkedTotalPrice.toFixed(2) }}</div>
          <div v-if="discountAmount > 0" class="discount-line">
            优惠：-¥{{ discountAmount.toFixed(2) }}
          </div>
          <div class="pay-line">
            实付：<b>¥{{ payAmount.toFixed(2) }}</b>
          </div>
        </div>
        <el-button
          type="danger"
          size="large"
          :disabled="!selectedAddressId"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交订单
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createOrder } from '@/api/order'
import { getAddressList } from '@/api/address'
import { getMyCoupons, useCoupon } from '@/api/coupon'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import type { Address } from '@/types/address'
import type { UserCouponWithDetail } from '@/types/coupon'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const addressList = ref<Address[]>([])
const selectedAddressId = ref<number>()
const myCoupons = ref<UserCouponWithDetail[]>([])
const selectedUserCouponId = ref<number | null>(null)
const loading = ref(false)
const submitting = ref(false)

// 只有未使用过、且满足最低消费门槛的优惠券才能在这里选
const usableCoupons = computed(() =>
  myCoupons.value.filter(
    (uc) => !uc.used && cartStore.checkedTotalPrice >= uc.coupon.minAmount
  )
)

const selectedCoupon = computed(() =>
  usableCoupons.value.find((uc) => uc.id === selectedUserCouponId.value)
)

const discountAmount = computed(() => {
  const uc = selectedCoupon.value
  if (!uc) return 0
  if (uc.coupon.type === 'fixed') {
    return uc.coupon.amount
  }
  // percent 类型：amount 是折扣力度（如 0.9），优惠金额 = 总价 × (1 - 折扣)
  return cartStore.checkedTotalPrice * (1 - uc.coupon.amount)
})

const payAmount = computed(() =>
  Math.max(cartStore.checkedTotalPrice - discountAmount.value, 0)
)

async function fetchAddressList() {
  if (!userStore.userInfo) return
  addressList.value = await getAddressList(userStore.userInfo.id)
  const defaultAddr = addressList.value.find((a) => a.isDefault)
  selectedAddressId.value = defaultAddr ? defaultAddr.id : addressList.value[0]?.id
}

async function fetchMyCoupons() {
  if (!userStore.userInfo) return
  myCoupons.value = await getMyCoupons(userStore.userInfo.id)
}

async function initData() {
  loading.value = true
  try {
    await Promise.all([fetchAddressList(), fetchMyCoupons()])
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }

  submitting.value = true
  try {
    const order = await createOrder({
      userId: userStore.userInfo.id,
      addressId: selectedAddressId.value,
      discountAmount: discountAmount.value,
      items: cartStore.checkedItems.map((item) => ({
        productId: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity
      }))
    })

    // 如果用了优惠券，标记为已使用
    if (selectedUserCouponId.value) {
      await useCoupon(selectedUserCouponId.value)
    }

    // 下单成功后，把已结算的商品从购物车移除
    cartStore.removeCheckedItems()
    ElMessage.success('下单成功')
    router.push(`/order/${order.id}`)
  } finally {
    submitting.value = false
  }
}

onMounted(initData)
</script>

<style scoped>
.checkout-page {
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

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
}

.section > h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  height: auto;
  width: 100%;
  padding: 12px 16px;
  margin-right: 0;
}

.address-content {
  margin-left: 8px;
}

.address-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.address-name {
  font-weight: bold;
}

.address-detail {
  color: #666;
  font-size: 13px;
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

.coupon-select {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coupon-hint {
  color: #999;
  font-size: 12px;
}

.no-coupon-hint {
  color: #999;
  font-size: 13px;
  margin-top: 8px;
}

.submit-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
}

.price-detail {
  text-align: right;
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}

.discount-line {
  color: #f56c6c;
}

.pay-line b {
  color: #f56c6c;
  font-size: 22px;
}
</style>
