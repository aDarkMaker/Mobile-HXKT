import { ref, watch } from 'vue'

export interface User {
	id?: number
	username: string
	nickname?: string
	avatar?: string | null
	token?: string
}

const STORAGE_KEY_AUTH = 'hxkt.auth'
const STORAGE_KEY_USER = 'hxkt.user'

const isAuthenticated = ref<boolean>(false)
const currentUser = ref<User | null>(null)

function loadAuth() {
	if (typeof window === 'undefined') return

	// 检查是否有认证信息
	const authToken = window.localStorage.getItem(STORAGE_KEY_AUTH)
	const userStr = window.localStorage.getItem(STORAGE_KEY_USER)

	if (authToken && userStr) {
		try {
			currentUser.value = JSON.parse(userStr)
			isAuthenticated.value = true
		} catch {
			// 解析失败，清除无效数据
			clearAuth()
		}
	}
}

function saveAuth(user: User, token: string) {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(STORAGE_KEY_AUTH, token)
	window.localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
}

function clearAuth() {
	if (typeof window === 'undefined') return
	window.localStorage.removeItem(STORAGE_KEY_AUTH)
	window.localStorage.removeItem(STORAGE_KEY_USER)
	isAuthenticated.value = false
	currentUser.value = null
}

// 初始化时加载认证状态
loadAuth()

export function useAuth() {
	const login = async (username: string, password: string): Promise<void> => {
		// TODO: 调用后端API进行登录
		// 临时实现：模拟登录
		try {
			// 这里应该调用实际的API
			// const response = await fetch('/api/auth/login', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({ username, password })
			// })
			// const data = await response.json()

			// 临时模拟登录成功
			const mockUser: User = {
				id: 1,
				username,
				nickname: username,
				avatar: null,
			}
			const mockToken = 'mock_token_' + Date.now()

			saveAuth(mockUser, mockToken)
			currentUser.value = mockUser
			isAuthenticated.value = true
		} catch (error) {
			console.error('Login failed:', error)
			throw error
		}
	}

	const register = async (
		username: string,
		password: string,
		nickname?: string,
	): Promise<void> => {
		// TODO: 调用后端API进行注册
		// 临时实现：模拟注册
		try {
			// 这里应该调用实际的API
			// const response = await fetch('/api/auth/register', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({ username, password, nickname })
			// })
			// const data = await response.json()

			// 临时模拟注册成功
			const mockUser: User = {
				id: Date.now(),
				username,
				nickname: nickname || username,
				avatar: null,
			}
			const mockToken = 'mock_token_' + Date.now()

			saveAuth(mockUser, mockToken)
			currentUser.value = mockUser
			isAuthenticated.value = true
		} catch (error) {
			console.error('Register failed:', error)
			throw error
		}
	}

	const logout = () => {
		clearAuth()
	}

	return {
		isAuthenticated,
		currentUser,
		login,
		register,
		logout,
	}
}
