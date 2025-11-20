// API config

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://118.195.243.30:8000'

function getAuthToken(): string | null {
	if (typeof window === 'undefined') return null
	return window.localStorage.getItem('hxkt.auth')
}

// 请求通用
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`
	const token = getAuthToken()

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...((options.headers as Record<string, string>) || {}),
	}

	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}

	const response = await fetch(url, {
		...options,
		headers,
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ detail: response.statusText }))
		throw new Error(error.detail || `HTTP ${response.status}`)
	}

	if (response.status === 204) {
		return undefined as T
	}

	return response.json()
}

// 登陆认证
export const authApi = {
	// 注册
	register: async (username: string, password: string, nickname?: string) => {
		return request<{ access_token: string }>('/auth/register', {
			method: 'POST',
			body: JSON.stringify({ username, password, nickname }),
		})
	},

	// 登录
	login: async (username: string, password: string) => {
		const formData = new URLSearchParams()
		formData.append('username', username)
		formData.append('password', password)

		return request<{ access_token: string }>('/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: formData.toString(),
		})
	},

	// 获取信息
	getMe: async () => {
		return request<{
			id: number
			username: string
			nickname: string | null
			avatar: string | null
			qq: string | null
			created_at: string
		}>('/auth/me')
	},

	// 更新
	updateProfile: async (profile: { nickname?: string; avatar?: string; qq?: string }) => {
		return request<{
			id: number
			username: string
			nickname: string | null
			avatar: string | null
			qq: string | null
			created_at: string
		}>('/auth/me', {
			method: 'PUT',
			body: JSON.stringify(profile),
		})
	},

	// 修改密码
	changePassword: async (oldPassword: string, newPassword: string) => {
		return request<void>('/auth/change-password', {
			method: 'POST',
			body: JSON.stringify({
				old_Password: oldPassword,
				new_Password: newPassword,
			}),
		})
	},
}

// TASK API
export const taskApi = {
	// 获取列表
	getTasks: async (scope: 'available' | 'my' = 'available') => {
		return request<
			Array<{
				publisher: string
				id: number
				title: string
				description: string
				type: 'personal' | 'team'
				priority: number
				max_accept_count: number
				deadline: string | null
				tags: string[]
				status: string | null
				publisher_id: number
				publisher_name: string
				accepted_count: number
				created_at: string
				is_accepted: boolean
			}>
		>(`/tasks?scope=${scope}`)
	},

	// 创建
	createTask: async (task: {
		title: string
		description: string
		type: 'personal' | 'team'
		priority: number
		deadline: string | null
		tags: string[]
		max_accept_count: number
	}) => {
		return request<{
			id: number
			title: string
			description: string
			type: 'personal' | 'team'
			priority: number
			deadline: string | null
			tags: string[]
			max_accept_count: number
			status: string | null
			publisher_id: number
			publisher_name: string
			accepted_count: number
			created_at: string
			is_accepted: boolean
		}>('/tasks', {
			method: 'POST',
			body: JSON.stringify(task),
		})
	},

	// 获取任务详情
	getTask: async (taskId: number) => {
		return request<{
			id: number
			title: string
			description: string
			type: 'personal' | 'team'
			priority: number
			max_accept_count: number
			deadline: string | null
			tags: string[]
			status: string | null
			publisher_id: number
			publisher_name: string
			accepted_count: number
			created_at: string
			is_accepted: boolean
		}>(`/tasks/${taskId}`)
	},

	// 接取任务
	acceptTask: async (taskId: number) => {
		return request<{
			id: number
			title: string
			description: string
			type: 'personal' | 'team'
			priority: number
			max_accept_count: number
			deadline: string | null
			tags: string[]
			status: string | null
			publisher_id: number
			publisher_name: string
			accepted_count: number
			created_at: string
			is_accepted: boolean
		}>(`/tasks/${taskId}/accept`, {
			method: 'POST',
		})
	},

	// 完成任务
	completeTask: async (taskId: number) => {
		return request<{
			id: number
			title: string
			description: string
			type: 'personal' | 'team'
			priority: number
			max_accept_count: number
			deadline: string | null
			tags: string[]
			status: string | null
			publisher_id: number
			publisher_name: string
			accepted_count: number
			created_at: string
			is_accepted: boolean
		}>(`/tasks/${taskId}/complete`, {
			method: 'POST',
		})
	},

	// 放弃任务
	abandonTask: async (taskId: number) => {
		return request<{
			id: number
			title: string
			description: string
			type: 'personal' | 'team'
			priority: number
			max_accept_count: number
			deadline: string | null
			tags: string[]
			status: string | null
			publisher_id: number
			publisher_name: string
			accepted_count: number
			created_at: string
			is_accepted: boolean
		}>(`/tasks/${taskId}/abandon`, {
			method: 'POST',
		})
	},
}

// Bilibili API 已移至单独模块，避免与动态导入冲突
