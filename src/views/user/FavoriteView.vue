<template>
  <div class="favorite-page">
    <h2>我的收藏</h2>

    <el-empty v-if="favoriteStore.items.length === 0" description="还没有收藏任何商品">
      <el-button type="primary" @click="router.push('/product')">去逛逛</el-button>
    </el-empty>

    <div v-else class="favorite-grid">
      <div v-for="item in favoriteStore.items" :key="item.id" class="favorite-card">
        <img :src="item.image" class="favorite-image" @click="router.push(`/product/${item.id}`)" />
        <div class="favorite-info">
          <div class="favorite-name" @click="router.push(`/product/${item.id}`)">
            {{ item.name }}
          </div>
          <div class="favorite-price">¥{{ item.price.toFixed(2) }}</div>
          <el-button link type="danger" @click="favoriteStore.removeFavorite(item.id)">
            取消收藏
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '@/store/favorite'

const router = useRouter()
const favoriteStore = useFavoriteStore()
</script>

<style scoped>
.favorite-page {
  padding: 20px;
}

.favorite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.favorite-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.favorite-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  cursor: pointer;
  display: block;
}

.favorite-info {
  padding: 12px;
}

.favorite-name {
  font-size: 14px;
  color: #333;
  cursor: pointer;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.favorite-price {
  color: #f56c6c;
  font-weight: bold;
  margin: 8px 0;
}
</style>
