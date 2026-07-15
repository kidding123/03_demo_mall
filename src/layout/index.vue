<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">{{ isCollapse ? 'V' : 'Vue Mall' }}</div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/product">
          <el-icon><Goods /></el-icon>
          <span>商品</span>
        </el-menu-item>
        <el-menu-item index="/seckill">
          <el-icon><Timer /></el-icon>
          <span>秒杀</span>
        </el-menu-item>
        <el-menu-item index="/order/list">
          <el-icon><List /></el-icon>
          <span>我的订单</span>
        </el-menu-item>
        <el-menu-item index="/favorite">
          <el-icon><Star /></el-icon>
          <span>我的收藏</span>
        </el-menu-item>
        <el-menu-item index="/coupon">
          <el-icon><Ticket /></el-icon>
          <span>优惠券</span>
        </el-menu-item>
        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <span>关于</span>
        </el-menu-item>

        <!-- 只有管理员角色才看得到这个入口 -->
        <el-sub-menu v-if="userStore.userInfo?.role === 'admin'" index="admin">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>管理后台</span>
          </template>
          <el-menu-item index="/admin/dashboard">数据看板</el-menu-item>
          <el-menu-item index="/admin/product">商品管理</el-menu-item>
          <el-menu-item index="/admin/order">订单管理</el-menu-item>
          <el-menu-item index="/admin/user">用户管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>

        <div class="header-right">
          <!-- 购物车入口 -->
          <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0" class="cart-badge">
            <el-icon class="cart-icon" @click="router.push('/cart')">
              <ShoppingCart />
            </el-icon>
          </el-badge>

          <!-- 已登录：显示头像+昵称下拉菜单；未登录：显示登录按钮 -->
          <el-dropdown v-if="userStore.isLoggedIn">
            <span class="user-info">
              <el-avatar :size="28" :src="userStore.userInfo?.avatar" />
              {{ userStore.userInfo?.nickname }}
              <el-tag v-if="userStore.userInfo?.role === 'admin'" size="small" type="danger">
                管理员
              </el-tag>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-else link type="primary" @click="router.push('/login')">
            登录
          </el-button>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  HomeFilled,
  InfoFilled,
  Fold,
  Expand,
  ArrowDown,
  Goods,
  ShoppingCart,
  List,
  Setting,
  Star,
  Ticket,
  Timer
} from '@element-plus/icons-vue'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'

const isCollapse = ref(false)
const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => route.path)
const cartStore = useCartStore()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #001529;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.cart-badge {
  display: flex;
  align-items: center;
}

.cart-icon {
  font-size: 22px;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.main {
  background-color: #f0f2f5;
}
</style>
