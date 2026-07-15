<template>
  <div v-loading="loading" class="product-detail-page">
    <el-page-header content="商品详情" @back="router.back()" class="page-header" />

    <div v-if="product" class="detail-content">
      <div class="detail-left">
        <!-- 主图，点击可放大查看（Element Plus 自带的图片预览/灯箱效果） -->
        <el-image
          :src="activeImage"
          :preview-src-list="galleryImages"
          :initial-index="activeIndex"
          fit="cover"
          class="main-image"
          preview-teleported
        />
        <!-- 缩略图切换 -->
        <div v-if="galleryImages.length > 1" class="thumb-list">
          <img
            v-for="(img, index) in galleryImages"
            :key="index"
            :src="img"
            class="thumb"
            :class="{ active: index === activeIndex }"
            @click="activeIndex = index"
          />
        </div>
      </div>

      <div class="detail-right">
        <h1 class="title">{{ product.name }}</h1>

        <div class="price-box">
          <span class="price">¥{{ product.price.toFixed(2) }}</span>
          <span class="origin-price">¥{{ product.originPrice.toFixed(2) }}</span>
        </div>

        <div class="meta-row">
          <span>销量 {{ product.sales }}</span>
          <span>库存 {{ product.stock }}</span>
          <el-rate v-model="product.rating" disabled />
        </div>

        <el-divider />

        <div class="description">{{ product.description }}</div>

        <el-divider />

        <div class="quantity-row">
          <span>数量</span>
          <el-input-number v-model="quantity" :min="1" :max="product.stock" />
        </div>

        <div class="action-row">
          <el-button type="warning" size="large" @click="addToCart">
            加入购物车
          </el-button>
          <el-button type="danger" size="large" @click="buyNow">
            立即购买
          </el-button>
          <el-button
            size="large"
            :icon="isFavorited ? StarFilled : Star"
            @click="handleToggleFavorite"
          >
            {{ isFavorited ? '已收藏' : '收藏' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 商品评价 -->
    <div v-if="product" class="review-section">
      <div class="review-header">
        <h3>商品评价（{{ reviewList.length }}）</h3>
        <div v-if="reviewList.length > 0" class="avg-rating">
          <span>平均评分</span>
          <el-rate :model-value="avgRating" disabled allow-half />
          <span>{{ avgRating.toFixed(1) }}</span>
        </div>
      </div>

      <!-- 写评价 -->
      <div v-if="userStore.isLoggedIn" class="review-form">
        <el-rate v-model="newReview.rating" />
        <el-input
          v-model="newReview.content"
          type="textarea"
          :rows="3"
          placeholder="说说你的使用感受吧"
          class="review-input"
        />
        <el-button type="primary" :loading="submittingReview" @click="handleSubmitReview">
          提交评价
        </el-button>
      </div>
      <div v-else class="review-login-tip">
        <el-link type="primary" @click="goLogin">登录</el-link>
        后可以发表评价
      </div>

      <el-divider />

      <!-- 评价列表 -->
      <el-empty v-if="reviewList.length === 0" description="暂无评价，来做第一个评价的人吧" />
      <div v-for="review in reviewList" :key="review.id" class="review-item">
        <el-avatar :size="36" :src="review.avatar" />
        <div class="review-content">
          <div class="review-top">
            <span class="review-username">{{ review.username }}</span>
            <el-rate :model-value="review.rating" disabled size="small" />
          </div>
          <div class="review-text">{{ review.content }}</div>
          <div class="review-time">{{ review.createdAt }}</div>
        </div>
      </div>
    </div>

    <el-empty v-else-if="!loading" description="商品不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { getProductDetail } from '@/api/product'
import { getReviewList, createReview } from '@/api/review'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import { useFavoriteStore } from '@/store/favorite'
import type { Product } from '@/types/product'
import type { Review } from '@/types/review'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()

const product = ref<Product | null>(null)
const loading = ref(false)
const quantity = ref(1)

// 详情多图相关：管理后台手动新增的商品可能没有 images 字段，做个兜底用主图代替
const activeIndex = ref(0)
const galleryImages = computed(() => {
  if (!product.value) return []
  return product.value.images && product.value.images.length > 0
    ? product.value.images
    : [product.value.image]
})
const activeImage = computed(() => galleryImages.value[activeIndex.value] || '')

const reviewList = ref<Review[]>([])
const newReview = ref({ rating: 5, content: '' })
const submittingReview = ref(false)

const isFavorited = computed(() =>
  product.value ? favoriteStore.isFavorite(product.value.id) : false
)

const avgRating = computed(() => {
  if (reviewList.value.length === 0) return 0
  const sum = reviewList.value.reduce((total, r) => total + r.rating, 0)
  return sum / reviewList.value.length
})

async function fetchDetail() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    product.value = await getProductDetail(id)
    activeIndex.value = 0
  } finally {
    loading.value = false
  }
}

async function fetchReviews() {
  if (!product.value) return
  reviewList.value = await getReviewList(product.value.id)
}

// 未登录时拦截，跳转登录页并记住当前页面，登录后可以跳回来
function checkLogin() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    goLogin()
    return false
  }
  return true
}

function goLogin() {
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

function addToCart() {
  if (!product.value) return
  if (!checkLogin()) return

  cartStore.addToCart(product.value, quantity.value)
  ElMessage.success(`已加入购物车 x${quantity.value}`)
}

function buyNow() {
  if (!product.value) return
  if (!checkLogin()) return

  cartStore.addToCart(product.value, quantity.value)
  router.push('/cart')
}

function handleToggleFavorite() {
  if (!product.value) return
  if (!checkLogin()) return

  const favorited = favoriteStore.toggleFavorite(product.value)
  ElMessage.success(favorited ? '收藏成功' : '已取消收藏')
}

async function handleSubmitReview() {
  if (!product.value) return
  if (!checkLogin()) return
  if (!newReview.value.content.trim()) {
    ElMessage.warning('请填写评价内容')
    return
  }

  submittingReview.value = true
  try {
    await createReview({
      productId: product.value.id,
      userId: userStore.userInfo!.id,
      username: userStore.userInfo!.nickname,
      avatar: userStore.userInfo!.avatar,
      rating: newReview.value.rating,
      content: newReview.value.content
    })
    ElMessage.success('评价成功')
    newReview.value = { rating: 5, content: '' }
    fetchReviews()
  } finally {
    submittingReview.value = false
  }
}

onMounted(async () => {
  await fetchDetail()
  fetchReviews()
})
</script>

<style scoped>
.product-detail-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.detail-content {
  display: flex;
  gap: 32px;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.detail-left {
  flex: 0 0 400px;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  cursor: zoom-in;
}

.thumb-list {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.7;
  transition: border-color 0.2s, opacity 0.2s;
}

.thumb:hover {
  opacity: 1;
}

.thumb.active {
  border-color: #f56c6c;
  opacity: 1;
}

.detail-right {
  flex: 1;
}

.title {
  font-size: 22px;
  margin-bottom: 12px;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.price {
  color: #f56c6c;
  font-size: 28px;
  font-weight: bold;
}

.origin-price {
  color: #999;
  text-decoration: line-through;
}

.meta-row {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-top: 12px;
  color: #666;
}

.description {
  color: #666;
  line-height: 1.8;
}

.quantity-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.action-row {
  display: flex;
  gap: 16px;
}

.review-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.review-header h3 {
  margin: 0;
}

.avg-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.review-input {
  width: 100%;
}

.review-login-tip {
  color: #999;
  font-size: 14px;
}

.review-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-content {
  flex: 1;
}

.review-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.review-username {
  font-weight: bold;
  font-size: 14px;
}

.review-text {
  color: #333;
  line-height: 1.6;
}

.review-time {
  color: #999;
  font-size: 12px;
  margin-top: 6px;
}
</style>
