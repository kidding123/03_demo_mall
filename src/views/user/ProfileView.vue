<template>
  <div class="profile-page">
    <div class="profile-card">
      <el-avatar :size="80" :src="userStore.userInfo?.avatar" />
      <h2>
        {{ userStore.userInfo?.nickname }}
        <el-tag v-if="userStore.userInfo?.role === 'admin'" size="small" type="danger">
          管理员
        </el-tag>
      </h2>
      <p>用户名：{{ userStore.userInfo?.username }}</p>
      <p v-if="userStore.userInfo?.phone">手机号：{{ userStore.userInfo?.phone }}</p>
    </div>

    <div class="menu-list">
      <div class="menu-item" @click="router.push('/order/list')">
        <el-icon><List /></el-icon>
        <span>我的订单</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="router.push('/address')">
        <el-icon><Location /></el-icon>
        <span>我的地址</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="router.push('/favorite')">
        <el-icon><Star /></el-icon>
        <span>我的收藏</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div class="menu-item" @click="router.push('/cart')">
        <el-icon><ShoppingCart /></el-icon>
        <span>我的购物车</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div v-if="userStore.userInfo?.role === 'admin'" class="menu-item" @click="router.push('/admin/product')">
        <el-icon><Setting /></el-icon>
        <span>管理后台</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
    </div>

    <el-button class="logout-btn" @click="handleLogout">退出登录</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { List, ShoppingCart, ArrowRight, Setting, Star, Location } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.profile-page {
  padding: 20px;
  max-width: 500px;
}

.profile-card {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  margin-bottom: 16px;
}

.profile-card h2 {
  margin: 12px 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.profile-card p {
  color: #666;
  margin: 4px 0;
}

.menu-list {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item span {
  flex: 1;
}

.menu-item .arrow {
  color: #ccc;
}

.logout-btn {
  width: 100%;
}
</style>
