<template>
  <div class="about-page">
    <!-- 网站标头 -->
    <div class="hero-section">
      <div class="hero-icon">🏪</div>
      <h1 class="hero-title">关于 Vue Mall</h1>
      <p class="hero-desc">一个功能完整的在线购物商城，为您提供便捷、安心的购物体验</p>
    </div>

    <!-- 平台简介 -->
    <el-card class="section-card">
      <template #header>
        <div class="section-title">
          <el-icon><InfoFilled /></el-icon>
          <span>平台简介</span>
        </div>
      </template>
      <div class="intro-content">
        <p>Vue Mall 是一个在线购物商城，提供从浏览商品到下单收货的完整购物体验。</p>
        <p>平台支持商品浏览与搜索、限时秒杀、购物车管理、在线下单、优惠券领取等核心功能，同时提供个人中心管理地址与收藏，满足日常网购需求。</p>
        <el-divider />
        <div class="intro-stats">
          <div class="stat">
            <span class="stat-num">100+</span>
            <span class="stat-label">在售商品</span>
          </div>
          <div class="stat">
            <span class="stat-num">4 种</span>
            <span class="stat-label">订单状态</span>
          </div>
          <div class="stat">
            <span class="stat-num">24/7</span>
            <span class="stat-label">在线服务</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 核心功能 -->
    <el-card class="section-card">
      <template #header>
        <div class="section-title">
          <el-icon><Grid /></el-icon>
          <span>核心功能</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col v-for="mod in modules" :key="mod.name" :xs="24" :sm="12" :md="8">
          <div class="module-card">
            <div class="module-icon">{{ mod.icon }}</div>
            <div class="module-info">
              <div class="module-name">{{ mod.name }}</div>
              <div class="module-desc">{{ mod.desc }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 使用帮助 -->
    <el-card class="section-card">
      <template #header>
        <div class="section-title">
          <el-icon><Guide /></el-icon>
          <span>使用帮助</span>
        </div>
      </template>

      <el-collapse v-model="activeHelp" class="help-collapse">
        <el-collapse-item title="📝 如何注册与登录？" name="1">
          <p>点击右上角的「登录」按钮进入登录页。首次使用请选择「注册」标签，填写昵称、邮箱和密码即可完成注册。注册成功后会自动登录，之后可直接用邮箱和密码登录。</p>
        </el-collapse-item>
        <el-collapse-item title="🛒 如何购买商品？" name="2">
          <p>浏览商品列表或通过分类筛选找到心仪商品 → 进入商品详情页查看信息与评价 → 选择数量后点击「加入购物车」或直接「立即购买」→ 在购物车中勾选要结算的商品 → 点击「结算」填写收货地址 → 提交订单即可。</p>
        </el-collapse-item>
        <el-collapse-item title="⚡ 秒杀怎么参与？" name="3">
          <p>在首页或侧边栏进入「秒杀」页面，可以看到正在进行的秒杀活动。秒杀商品有单独的倒计时显示，倒计时结束后点击「立即抢购」即可参与。秒杀商品数量有限，先到先得。</p>
        </el-collapse-item>
        <el-collapse-item title="🎫 如何使用优惠券？" name="4">
          <p>在「优惠券」页面可以查看可领取的优惠券列表，点击「立即领取」即可获得。下单结算时会自动匹配可用的优惠券，享受立减优惠。</p>
        </el-collapse-item>
        <el-collapse-item title="👑 管理员能做什么？" name="5">
          <p>管理员账号登录后，侧边栏会显示「管理后台」入口，包含数据看板（销售额统计、图表分析）、商品管理、订单管理和用户管理功能，方便进行运营管理。</p>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 联系反馈 -->
    <el-card class="section-card">
      <template #header>
        <div class="section-title">
          <el-icon><ChatLineSquare /></el-icon>
          <span>联系与反馈</span>
        </div>
      </template>
      <div class="contact-content">
        <p>如果您在使用过程中遇到任何问题，或有任何建议，欢迎通过以下方式联系我们：</p>
        <div class="contact-items">
          <div class="contact-item">
            <el-icon><Message /></el-icon>
            <span>邮箱：88888888@gmail.com</span>
          </div>
          <div class="contact-item">
            <el-icon><ChatDotSquare /></el-icon>
            <span>在线客服：工作日 9:00 - 18:00</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 底部 -->
    <div class="footer-note">
      <p>Vue Mall 在线商城 — 仅供学习与演示用途</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InfoFilled, Grid, Guide, ChatLineSquare, Message, ChatDotSquare } from '@element-plus/icons-vue'

interface ModuleItem {
  icon: string
  name: string
  desc: string
}

const activeHelp = ref(['1'])

const modules: ModuleItem[] = [
  { icon: '🏠', name: '首页推荐', desc: '轮播 Banner、分类导航与热销商品推荐' },
  { icon: '📦', name: '商品浏览', desc: '商品列表分页展示、分类筛选与详情查看' },
  { icon: '⚡', name: '限时秒杀', desc: '秒杀倒计时与限时抢购体验' },
  { icon: '🛒', name: '购物车', desc: '加入购物车、数量调整与合并结算' },
  { icon: '📋', name: '订单管理', desc: '下单结算、订单列表查看与订单详情追踪' },
  { icon: '🎫', name: '优惠券', desc: '优惠券领取，下单时自动抵扣' },
  { icon: '👤', name: '个人中心', desc: '地址管理、收藏管理、个人资料查看' },
  { icon: '🔧', name: '管理后台', desc: '数据看板、商品/订单/用户管理（管理员）' }
]
</script>

<style scoped>
.about-page {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

/* 网站标头 */
.hero-section {
  text-align: center;
  padding: 40px 20px 32px;
}

.hero-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.hero-title {
  font-size: 28px;
  margin: 0 0 10px;
  color: #303133;
}

.hero-desc {
  color: #909399;
  font-size: 15px;
  margin: 0;
}

/* 卡片通用 */
.section-card {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
}

/* 平台简介 */
.intro-content {
  line-height: 1.8;
  color: #606266;
}

.intro-content p {
  margin: 0 0 8px;
}

.intro-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
  padding: 8px 0;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-num {
  font-size: 22px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

/* 核心功能 */
.module-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 8px;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.module-card:hover {
  background: #f5f7fa;
}

.module-icon {
  font-size: 28px;
  flex-shrink: 0;
  line-height: 1;
}

.module-info {
  flex: 1;
  min-width: 0;
}

.module-name {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.module-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

/* 使用帮助 */
.help-collapse p {
  line-height: 1.8;
  color: #606266;
  margin: 0;
}

/* 联系反馈 */
.contact-content p {
  line-height: 1.8;
  color: #606266;
  margin: 0 0 16px;
}

.contact-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

/* 底部 */
.footer-note {
  text-align: center;
  padding: 32px 0 16px;
  color: #c0c4cc;
  font-size: 13px;
}

.footer-note p {
  margin: 0;
}

</style>
