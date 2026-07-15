<template>
  <div class="dashboard-page">
    <h2>数据看板</h2>

    <!-- 统计卡片：真实数据 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-label">总用户数</div>
          <div class="stat-value">{{ stats.userCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-label">总商品数</div>
          <div class="stat-value">{{ stats.productCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-label">总订单数</div>
          <div class="stat-value">{{ stats.orderCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-label">总销售额</div>
          <div class="stat-value">¥{{ stats.totalRevenue.toFixed(2) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="16">
        <el-card>
          <template #header>近 7 天销售趋势（演示数据）</template>
          <div ref="lineChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>订单状态分布</template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row class="chart-row">
      <el-col :span="24">
        <el-card>
          <template #header>商品销量 Top 5</template>
          <div ref="barChartRef" class="chart chart-tall"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getDashboardData } from '@/api/dashboard'

const stats = ref({
  userCount: 0,
  productCount: 0,
  orderCount: 0,
  totalRevenue: 0
})

const lineChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
const barChartRef = ref<HTMLDivElement>()

let lineChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

function handleResize() {
  lineChart?.resize()
  pieChart?.resize()
  barChart?.resize()
}

async function initCharts() {
  const data = await getDashboardData()

  stats.value = {
    userCount: data.userCount,
    productCount: data.productCount,
    orderCount: data.orderCount,
    totalRevenue: data.totalRevenue
  }

  // 折线图：近7天销售趋势
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value)
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 50, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: data.salesTrend.map((item) => item.date) },
      yAxis: { type: 'value' },
      series: [
        {
          data: data.salesTrend.map((item) => item.amount),
          type: 'line',
          smooth: true,
          areaStyle: {},
          itemStyle: { color: '#409EFF' }
        }
      ]
    })
  }

  // 饼图：订单状态分布
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          data: data.statusDistribution,
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.3)' }
          }
        }
      ]
    })
  }

  // 柱状图：商品销量 Top5
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
    barChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 110, right: 40, top: 20, bottom: 30 },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: data.topProducts.map((item) => item.name),
        axisLabel: { width: 90, overflow: 'truncate' }
      },
      series: [
        {
          data: data.topProducts.map((item) => item.sales),
          type: 'bar',
          itemStyle: { color: '#67C23A' }
        }
      ]
    })
  }
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
}

.dashboard-page h2 {
  margin-bottom: 16px;
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
}

.stat-label {
  color: #999;
  font-size: 13px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 26px;
  font-weight: bold;
  color: #303133;
}

.chart-row {
  margin-bottom: 16px;
}

.chart {
  height: 300px;
}

.chart-tall {
  height: 260px;
}
</style>
