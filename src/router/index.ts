import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Layout from '../layout/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 登录/注册页，独立页面，不使用 Layout 布局
      path: '/login',
      name: 'login',
      component: () => import('../views/user/LoginView.vue')
    },
    {
      path: '/',
      component: Layout,
      redirect: '/home',
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('../views/HomeView.vue')
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue')
        },
        {
          // 商品列表页
          path: 'product',
          name: 'product-list',
          component: () => import('../views/product/ProductList.vue')
        },
        {
          // 商品详情页，:id 是动态参数
          path: 'product/:id',
          name: 'product-detail',
          component: () => import('../views/product/ProductDetail.vue')
        },
        {
          // 秒杀页，浏览不需要登录，点"立即抢购"时才在页面内校验登录
          path: 'seckill',
          name: 'seckill',
          component: () => import('../views/seckill/SeckillView.vue')
        },
        {
          // 购物车页，需要登录
          path: 'cart',
          name: 'cart',
          component: () => import('../views/cart/CartView.vue'),
          meta: { requiresAuth: true }
        },
        {
          // 确认订单（结算）页，需要登录
          path: 'checkout',
          name: 'checkout',
          component: () => import('../views/order/CheckoutView.vue'),
          meta: { requiresAuth: true }
        },
        {
          // 我的订单列表，需要登录
          path: 'order/list',
          name: 'order-list',
          component: () => import('../views/order/OrderListView.vue'),
          meta: { requiresAuth: true }
        },
        {
          // 订单详情，需要登录
          path: 'order/:id',
          name: 'order-detail',
          component: () => import('../views/order/OrderDetailView.vue'),
          meta: { requiresAuth: true }
        },
        {
          // 我的收藏，需要登录
          path: 'favorite',
          name: 'favorite',
          component: () => import('../views/user/FavoriteView.vue'),
          meta: { requiresAuth: true }
        },
        {
          // 优惠券（领券中心 + 我的优惠券），需要登录
          path: 'coupon',
          name: 'coupon',
          component: () => import('../views/coupon/CouponCenterView.vue'),
          meta: { requiresAuth: true }
        },
        {
          // 个人中心，需要登录
          path: 'profile',
          name: 'profile',
          component: () => import('../views/user/ProfileView.vue'),
          meta: { requiresAuth: true }
        },
        {
          // 管理后台 - 数据看板，需要登录 且 必须是管理员角色
          path: 'admin/dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          // 管理后台 - 商品管理，需要登录 且 必须是管理员角色
          path: 'admin/product',
          name: 'admin-product',
          component: () => import('../views/admin/ProductManage.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          // 管理后台 - 订单管理，需要登录 且 必须是管理员角色
          path: 'admin/order',
          name: 'admin-order',
          component: () => import('../views/admin/OrderManage.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          // 管理后台 - 用户管理，需要登录 且 必须是管理员角色
          path: 'admin/user',
          name: 'admin-user',
          component: () => import('../views/admin/UserManage.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        }
      ]
    }
  ]
})

// 全局前置守卫：
// 1. 需要登录的页面，未登录跳转登录页，并记住原本要去的地址
// 2. 需要管理员权限的页面，非管理员直接拦截，跳回首页并提示
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
  const token = localStorage.getItem('token')

  if (requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (requiresAdmin) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
    if (!userInfo || userInfo.role !== 'admin') {
      ElMessage.error('没有权限访问该页面')
      next('/home')
      return
    }
  }

  next()
})

export default router
