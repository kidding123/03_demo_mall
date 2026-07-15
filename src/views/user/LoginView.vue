<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="brand">Vue Mall</h1>

      <el-tabs v-model="activeTab" stretch>
        <el-tab-pane label="登录" name="login">
          <el-form ref="loginFormRef" :model="loginForm" :rules="rules">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="用户名" :prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
              登录
            </el-button>
          </el-form>
          <div class="tip">测试账号：test / 123456</div>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form ref="registerFormRef" :model="registerForm" :rules="rules">
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" placeholder="用户名" :prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleRegister"
              />
            </el-form-item>
            <el-button type="primary" class="submit-btn" :loading="loading" @click="handleRegister">
              注册
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login, register } from '@/api/user'
import { useUserStore } from '@/store/user'
import type { AuthResult } from '@/types/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', password: '' })

const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 登录/注册成功后的公共逻辑：存状态 + 跳转回原本要去的页面
function afterAuthSuccess(result: AuthResult) {
  userStore.setToken(result.token)
  userStore.setUserInfo(result.userInfo)
  const redirect = (route.query.redirect as string) || '/home'
  router.push(redirect)
}

async function handleLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const result = await login(loginForm)
      ElMessage.success('登录成功')
      afterAuthSuccess(result)
    } finally {
      loading.value = false
    }
  })
}

async function handleRegister() {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const result = await register(registerForm)
      ElMessage.success('注册成功')
      afterAuthSuccess(result)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 380px;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.brand {
  text-align: center;
  margin: 0 0 24px 0;
  color: #764ba2;
}

.submit-btn {
  width: 100%;
}

.tip {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}
</style>
