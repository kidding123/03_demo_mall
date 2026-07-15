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
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <!-- 管理员账号不允许被禁用，避免误操作把自己锁死 -->
          <el-button
            v-if="row.role !== 'admin'"
            link
            :type="row.disabled ? 'success' : 'danger'"
            @click="handleToggleStatus(row)"
          >
            {{ row.disabled ? '启用' : '禁用' }}
          </el-button>
          <span v-else class="disabled-hint">-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminUserList, toggleUserStatus } from '@/api/user'
import type { UserInfo } from '@/types/user'

const userList = ref<UserInfo[]>([])
const loading = ref(false)

async function fetchUserList() {
  loading.value = true
  try {
    userList.value = await getAdminUserList()
  } finally {
    loading.value = false
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

.disabled-hint {
  color: #ccc;
}
</style>
