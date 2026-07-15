<template>
  <div class="product-list-page">
    <!-- 搜索与分类筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索商品"
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>

      <el-radio-group v-model="activeCategory" @change="handleCategoryChange">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button
          v-for="cat in categories"
          :key="cat"
          :label="cat"
        >
          {{ cat }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 搜索历史 + 热门搜索：关键词为空时显示，方便快速选择 -->
    <div
      v-if="!keyword && (historyList.length > 0 || hotKeywords.length > 0)"
      class="search-suggest"
    >
      <div v-if="historyList.length > 0" class="suggest-row">
        <span class="suggest-label">历史搜索</span>
        <el-tag
          v-for="item in historyList"
          :key="item"
          class="suggest-tag"
          @click="applyKeyword(item)"
        >
          {{ item }}
        </el-tag>
        <el-icon class="clear-icon" @click="handleClearHistory"><Delete /></el-icon>
      </div>
      <div v-if="hotKeywords.length > 0" class="suggest-row">
        <span class="suggest-label">热门搜索</span>
        <el-tag
          v-for="item in hotKeywords"
          :key="item"
          type="danger"
          effect="plain"
          class="suggest-tag"
          @click="applyKeyword(item)"
        >
          {{ item }}
        </el-tag>
      </div>
    </div>

    <!-- 商品网格 -->
    <div v-loading="loading" class="product-grid">
      <el-empty v-if="!loading && productList.length === 0" description="没有找到相关商品" />
      <div
        v-for="item in productList"
        :key="item.id"
        class="product-card"
        @click="goDetail(item.id)"
      >
        <img :src="item.image" class="product-image" />
        <div class="product-info">
          <div class="product-name">{{ item.name }}</div>
          <div class="product-price">
            <span class="price">¥{{ item.price.toFixed(2) }}</span>
            <span class="origin-price">¥{{ item.originPrice.toFixed(2) }}</span>
          </div>
          <div class="product-meta">
            <span>销量 {{ item.sales }}</span>
            <el-rate v-model="item.rating" disabled size="small" />
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      class="pagination"
      background
      layout="prev, pager, next, total"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Delete } from '@element-plus/icons-vue'
import { getProductList, getCategories } from '@/api/product'
import { getHotKeywords } from '@/api/search'
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '@/utils/searchHistory'
import type { Product } from '@/types/product'

const router = useRouter()
const route = useRoute()

const productList = ref<Product[]>([])
const categories = ref<string[]>([])
const loading = ref(false)

// 支持从首页分类导航带 ?category=xxx 跳转过来，直接定位到对应分类
const keyword = ref('')
const activeCategory = ref((route.query.category as string) || '')
const page = ref(1)
const pageSize = ref(8)
const total = ref(0)

const historyList = ref<string[]>(getSearchHistory())
const hotKeywords = ref<string[]>([])

async function fetchCategories() {
  categories.value = await getCategories()
}

async function fetchProductList() {
  loading.value = true
  try {
    const res = await getProductList({
      page: page.value,
      pageSize: pageSize.value,
      category: activeCategory.value || undefined,
      keyword: keyword.value || undefined
    })
    productList.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  const trimmed = keyword.value.trim()
  if (trimmed) {
    addSearchHistory(trimmed)
    historyList.value = getSearchHistory()
  }
  fetchProductList()
}

function applyKeyword(word: string) {
  keyword.value = word
  handleSearch()
}

function handleClearHistory() {
  clearSearchHistory()
  historyList.value = []
}

function handleCategoryChange() {
  page.value = 1
  fetchProductList()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchProductList()
}

function goDetail(id: number) {
  router.push(`/product/${id}`)
}

// 已经停留在商品页时，从首页再点另一个分类跳转过来，也要能同步更新
watch(
  () => route.query.category,
  (newCategory) => {
    activeCategory.value = (newCategory as string) || ''
    page.value = 1
    fetchProductList()
  }
)

onMounted(async () => {
  fetchCategories()
  fetchProductList()
  hotKeywords.value = await getHotKeywords()
})
</script>

<style scoped>
.product-list-page {
  padding: 20px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.search-input {
  width: 280px;
}

.search-suggest {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.suggest-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 6px 0;
}

.suggest-label {
  color: #999;
  font-size: 13px;
  margin-right: 4px;
}

.suggest-tag {
  cursor: pointer;
}

.clear-icon {
  margin-left: auto;
  color: #ccc;
  cursor: pointer;
}

.clear-icon:hover {
  color: #f56c6c;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  min-height: 300px;
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
  height: 180px;
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

.product-price {
  margin-top: 8px;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin-right: 8px;
}

.origin-price {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.pagination {
  margin-top: 24px;
  justify-content: center;
  display: flex;
}
</style>
