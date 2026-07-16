<template>
  <div class="address-page">
    <div class="toolbar">
      <h2>我的地址</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增地址</el-button>
    </div>

    <div v-loading="loading">
      <el-empty v-if="!loading && addressList.length === 0" description="还没有添加收货地址" />

      <div v-for="addr in addressList" :key="addr.id" class="address-card">
        <div class="address-main">
          <div class="address-top">
            <span class="address-name">{{ addr.name }}</span>
            <span class="address-phone">{{ addr.phone }}</span>
            <el-tag v-if="addr.isDefault" size="small" type="success">默认</el-tag>
          </div>
          <div class="address-detail">
            {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
          </div>
        </div>
        <div class="address-actions">
          <el-button v-if="!addr.isDefault" link type="primary" @click="handleSetDefault(addr)">
            设为默认
          </el-button>
          <el-button link type="primary" @click="openDialog(addr)">编辑</el-button>
          <el-popconfirm title="确定删除这个地址吗？" @confirm="handleDelete(addr.id)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑地址' : '新增地址'" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="form.name" placeholder="收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="收货人手机号" />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="form.province" placeholder="如：广东省" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="form.city" placeholder="如：深圳市" />
        </el-form-item>
        <el-form-item label="区县" prop="district">
          <el-input v-model="form.district" placeholder="如：南山区" />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="form.detail" type="textarea" :rows="2" placeholder="街道、门牌号等" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAddressList, createAddress, updateAddress, deleteAddress } from '@/api/address'
import { useUserStore } from '@/store/user'
import type { Address } from '@/types/address'

const userStore = useUserStore()

const addressList = ref<Address[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const emptyForm = () => ({
  id: undefined as number | undefined,
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const form = reactive(emptyForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

async function fetchAddressList() {
  if (!userStore.userInfo) return
  loading.value = true
  try {
    addressList.value = await getAddressList(userStore.userInfo.id)
  } finally {
    loading.value = false
  }
}

function openDialog(addr?: Address) {
  if (addr) {
    isEdit.value = true
    Object.assign(form, addr)
  } else {
    isEdit.value = false
    Object.assign(form, emptyForm())
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value || !userStore.userInfo) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value && form.id) {
        await updateAddress(form.id, { ...form, userId: userStore.userInfo!.id })
        ElMessage.success('编辑成功')
      } else {
        await createAddress({ ...form, userId: userStore.userInfo!.id })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchAddressList()
    } finally {
      submitting.value = false
    }
  })
}

async function handleSetDefault(addr: Address) {
  await updateAddress(addr.id, { isDefault: true, userId: addr.userId })
  ElMessage.success('已设为默认地址')
  fetchAddressList()
}

async function handleDelete(id: number) {
  await deleteAddress(id)
  ElMessage.success('删除成功')
  fetchAddressList()
}

onMounted(fetchAddressList)
</script>

<style scoped>
.address-page {
  padding: 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.address-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.address-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.address-name {
  font-weight: bold;
}

.address-detail {
  color: #666;
  font-size: 13px;
}

.address-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>
