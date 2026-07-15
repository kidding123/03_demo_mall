<template>
  <div class="product-manage-page">
    <div class="toolbar">
      <h2>商品管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增商品</el-button>
    </div>

    <el-table v-loading="loading" :data="productList" border>
      <el-table-column label="商品图" width="90">
        <template #default="{ row }">
          <img :src="row.image" class="thumb" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" min-width="200" />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column label="价格" width="120">
        <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="90" />
      <el-table-column prop="sales" label="销量" width="90" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除这个商品吗？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      background
      layout="prev, pager, next, total"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      @current-change="handlePageChange"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="原价" prop="originPrice">
          <el-input-number v-model="form.originPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="封面图" prop="image">
          <el-input v-model="form.image" placeholder="列表页展示用的封面图 URL" />
        </el-form-item>

        <!-- 详情图片：支持动态增减，商品详情页的多图切换用的就是这里 -->
        <el-form-item label="详情图片">
          <div class="images-editor">
            <div v-for="(img, index) in form.images" :key="index" class="image-row">
              <el-input v-model="form.images[index]" placeholder="图片 URL" />
              <el-button type="danger" link @click="form.images.splice(index, 1)">
                删除
              </el-button>
            </div>
            <el-button size="small" @click="form.images.push('')">+ 添加图片</el-button>
            <div class="images-hint">不填的话，详情页会直接用上面的封面图代替</div>
          </div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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
import {
  getProductList,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/api/product'
import type { Product } from '@/types/product'

const productList = ref<Product[]>([])
const categories = ref<string[]>([])
const loading = ref(false)

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const emptyForm = () => ({
  id: undefined as number | undefined,
  name: '',
  category: '',
  price: 0,
  originPrice: 0,
  stock: 0,
  image: '',
  images: [] as string[],
  description: ''
})

const form = reactive(emptyForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

async function fetchCategories() {
  categories.value = await getCategories()
}

async function fetchProductList() {
  loading.value = true
  try {
    const res = await getProductList({ page: page.value, pageSize: pageSize.value })
    productList.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchProductList()
}

function openDialog(row?: Product) {
  if (row) {
    isEdit.value = true
    Object.assign(form, row)
    // 单独拷贝一份 images 数组，避免在弹窗里增删图片时，
    // 还没点保存就直接改到了列表里原本的数据
    form.images = row.images ? [...row.images] : []
  } else {
    isEdit.value = false
    Object.assign(form, emptyForm())
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      // 提交前把空白的图片输入项过滤掉
      const payload = {
        ...form,
        images: form.images.map((img) => img.trim()).filter((img) => img)
      }

      if (isEdit.value && form.id) {
        await updateProduct(form.id, payload)
        ElMessage.success('编辑成功')
      } else {
        await createProduct(payload)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchProductList()
    } finally {
      submitting.value = false
    }
  })
}

async function handleDelete(id: number) {
  await deleteProduct(id)
  ElMessage.success('删除成功')
  fetchProductList()
}

onMounted(() => {
  fetchCategories()
  fetchProductList()
})
</script>

<style scoped>
.product-manage-page {
  padding: 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  justify-content: center;
  display: flex;
}

.images-editor {
  width: 100%;
}

.image-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.images-hint {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}
</style>
