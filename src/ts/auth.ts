import { ref } from 'vue'
import { authApi } from '../utils/api'

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

const saveTokenOnly = (token: string) => {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(STORAGE_KEY_AUTH, token)
}

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
		try {
			const response = await authApi.login(username, password)
			const token = response.access_token
			saveTokenOnly(token) // 先存 token，保证后续请求带上 Authorization
			const userInfo = await authApi.getMe()

			const user: User = {
				id: userInfo.id,
				username: userInfo.username,
				nickname: userInfo.nickname || userInfo.username,
				avatar: userInfo.avatar,
			}

			saveAuth(user, token)
			currentUser.value = user
			isAuthenticated.value = true
		} catch (error) {
			clearAuth()
			console.error('Login failed:', error)
			throw error
		}
	}

	const register = async (
		username: string,
		password: string,
		nickname?: string,
	): Promise<void> => {
		try {
			const response = await authApi.register(username, password, nickname)
			const token = response.access_token
			saveTokenOnly(token)

			// 获取用户信息
			const userInfo = await authApi.getMe()

			const user: User = {
				id: userInfo.id,
				username: userInfo.username,
				nickname: userInfo.nickname || userInfo.username,
				avatar: userInfo.avatar,
			}

			saveAuth(user, token)
			currentUser.value = user
			isAuthenticated.value = true
		} catch (error) {
			clearAuth()
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
