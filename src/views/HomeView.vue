<template>
  <div class="home-page">
    <!-- 轮播图 -->
    <el-carousel height="320px" class="banner">
         <el-carousel-item v-for="banner in banners" :key="banner.id">
            <div class="banner-slide" style="cursor: pointer" @click="router.push(banner.link)">
             <img :src="banner.image" class="banner-image" />
             <div class="banner-title">{{ banner.title }}</div>
           </div>
         </el-carousel-item>
    </el-carousel>

    <!-- 秒杀入口横幅 -->
    <div class="seckill-entry" @click="router.push('/seckill')">
      <span>⚡ 限时秒杀，低至 5 折，手慢无</span>
      <el-icon><ArrowRight /></el-icon>
    </div>

    <!-- 分类快捷导航 -->
    <div class="category-nav">
      <div v-for="cat in categories" :key="cat" class="category-item" @click="goCategory(cat)">
        <el-icon :size="28"><Goods /></el-icon>
        <span>{{ cat }}</span>
      </div>
    </div>

    <!-- 热销推荐 -->
    <div class="section-header">
      <h3>热销推荐</h3>
      <el-button link type="primary" @click="router.push('/product')">查看全部 ></el-button>
    </div>

    <div v-loading="loading" class="product-grid">
      <div
        v-for="item in recommendList"
        :key="item.id"
        class="product-card"
        @click="router.push(`/product/${item.id}`)"
      >
        <img :src="item.image" class="product-image" />
        <div class="product-info">
          <div class="product-name">{{ item.name }}</div>
          <div class="price">¥{{ item.price.toFixed(2) }}</div>
          <div class="product-sales">销量 {{ item.sales }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Goods, ArrowRight } from '@element-plus/icons-vue'
import { getBannerList } from '@/api/banner'
import { getCategories, getProductList } from '@/api/product'
import type { Product } from '@/types/product'
import type { Banner } from '@/api/banner'

const router = useRouter()

const banners = ref<Banner[]>([])
const categories = ref<string[]>([])
const recommendList = ref<Product[]>([])
const loading = ref(false)

function goCategory(category: string) {
  router.push({ path: '/product', query: { category } })
}

async function fetchData() {
  loading.value = true
  try {
    const [bannerRes, categoryRes, productRes] = await Promise.all([
      getBannerList(),
      getCategories(),
      getProductList({ page: 1, pageSize: 30 })
    ])
    banners.value = bannerRes
    categories.value = categoryRes
    // 按销量排序，取前 8 个作为"热销推荐"
    recommendList.value = [...productRes.list].sort((a, b) => b.sales - a.sales).slice(0, 8)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.home-page {
  padding: 20px;
}

.banner {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.banner-slide {
  position: relative;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-title {
  position: absolute;
  bottom: 24px;
  left: 24px;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.seckill-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee0979 100%);
  color: #fff;
  border-radius: 8px;
  padding: 14px 20px;
  margin-bottom: 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.category-nav {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.category-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.category-item:hover {
  color: #409eff;
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  min-height: 200px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.product-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  color: #333;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.price {
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
  margin-top: 6px;
}

.product-sales {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}
</style>
