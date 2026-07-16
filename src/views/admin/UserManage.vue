<template>
  <div class="user-manage-page">
    <h2>用户管理</h2>

    <el-table v-loading="loading" :data="userList" border>
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <el-avatar :size="36" :src="row.avatar" />
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="140" />
      <el-table-column prop="nickname" label="昵称" width="140" />
      <el-table-column label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.disabled ? 'danger' : 'success'">
            {{ row.disabled ? '已禁用' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          <!-- 管理员账号不允许被禁用，避免误操作把自己锁死 -->
          <el-button
            v-if="row.role !== 'admin'"
            link
            :type="row.disabled ? 'success' : 'danger'"
            @click="handleToggleStatus(row)"
          >
            {{ row.disabled ? '启用' : '禁用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="520px">
      <div v-loading="loadingDetail">
        <template v-if="detailUser">
          <div class="detail-header">
            <el-avatar :size="60" :src="detailUser.avatar" />
            <div>
              <div class="detail-name">
                {{ detailUser.nickname }}
                <el-tag :type="detailUser.role === 'admin' ? 'danger' : 'info'" size="small">
                  {{ detailUser.role === 'admin' ? '管理员' : '普通用户' }}
                </el-tag>
              </div>
              <div class="detail-sub">用户名：{{ detailUser.username }}</div>
            </div>
          </div>

          <el-descriptions :column="1" border class="detail-descriptions">
            <el-descriptions-item label="用户 ID">{{ detailUser.id }}</el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ detailUser.phone || '未填写' }}
            </el-descriptions-item>
            <el-descriptions-item label="账号状态">
              <el-tag :type="detailUser.disabled ? 'danger' : 'success'" size="small">
                {{ detailUser.disabled ? '已禁用' : '正常' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="累计订单数">{{ detailOrderCount }}</el-descriptions-item>
          </el-descriptions>

          <div class="address-block">
            <h4>收货地址（{{ detailAddresses.length }}）</h4>
            <el-empty
              v-if="detailAddresses.length === 0"
              description="还没有添加收货地址"
              :image-size="60"
            />
            <div v-for="addr in detailAddresses" :key="addr.id" class="address-item">
              <div class="address-top">
                <span class="address-name">{{ addr.name }}</span>
                <span>{{ addr.phone }}</span>
                <el-tag v-if="addr.isDefault" size="small" type="success">默认</el-tag>
              </div>
              <div class="address-text">
                {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminUserList, toggleUserStatus } from '@/api/user'
import { getAddressList } from '@/api/address'
import { getAdminOrderList } from '@/api/order'
import type { UserInfo } from '@/types/user'
import type { Address } from '@/types/address'

const userList = ref<UserInfo[]>([])
const loading = ref(false)

const detailVisible = ref(false)
const loadingDetail = ref(false)
const detailUser = ref<UserInfo | null>(null)
const detailAddresses = ref<Address[]>([])
const detailOrderCount = ref(0)

async function fetchUserList() {
  loading.value = true
  try {
    userList.value = await getAdminUserList()
  } finally {
    loading.value = false
  }
}

async function openDetail(row: UserInfo) {
  detailUser.value = row
  detailVisible.value = true
  loadingDetail.value = true
  try {
    const [addresses, orders] = await Promise.all([getAddressList(row.id), getAdminOrderList()])
    detailAddresses.value = addresses
    detailOrderCount.value = orders.filter((o) => o.userId === row.id).length
  } finally {
    loadingDetail.value = false
  }
}

async function handleToggleStatus(row: UserInfo) {
  const actionText = row.disabled ? '启用' : '禁用'
  await ElMessageBox.confirm(`确定要${actionText}账号「${row.username}」吗？`, '提示', {
    type: 'warning'
  })

  await toggleUserStatus(row.id, !row.disabled)
  row.disabled = !row.disabled
  ElMessage.success(`已${actionText}`)
}

onMounted(fetchUserList)
</script>

<style scoped>
.user-manage-page {
  padding: 20px;
}

.user-manage-page h2 {
  margin-bottom: 16px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-name {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-sub {
  color: #999;
  font-size: 13px;
  margin-top: 4px;
}

.detail-descriptions {
  margin-bottom: 20px;
}

.address-block h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.address-item {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.address-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.address-name {
  font-weight: bold;
}

.address-text {
  color: #666;
  font-size: 13px;
}
</style>
