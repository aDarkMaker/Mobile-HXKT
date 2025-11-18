export type TaskType = 'personal' | 'team'
export type TaskStatus = 'available' | 'inProgress' | 'completed'
export type TaskPriority = 1 | 2 | 3 | 4 // 1:低, 2:中, 3:高, 4:紧急
export type TaskTabType = 'available' | 'my-tasks' // 标签页类型

export interface Task {
	id: string
	title: string
	description: string
	type: TaskType
	priority: TaskPriority
	publisherName: string
	createdAt: Date | string
	deadline?: Date | string | null
	tags: string[]
	acceptedCount: number
	maxAcceptCount: number
	isAccepted: boolean
	status?: TaskStatus
	acceptedAt?: Date | string
}

export interface TaskFormData {
	title: string
	description: string
	type: TaskType
	priority: TaskPriority
	deadline?: string | null
	tags: string[]
	maxAcceptCount: number
}

// API 返回的任务数据格式
export interface ApiTask {
	id: number
	title: string
	description: string
	type: TaskType
	priority: number
	publisher_name: string
	created_at: string
	deadline?: string | null
	tags: string[]
	accepted_count: number
	max_accept_count: number
	status?: string | null
	is_accepted?: boolean
}

// API 返回的已接取任务数据格式
export interface ApiTaskAcceptance {
	id: number
	task_id: number
	user_id: number
	status: string
	accepted_at: string
	task: ApiTask
}

export function convertApiTaskToTask(apiTask: ApiTask): Task {
	return {
		id: String(apiTask.id),
		title: apiTask.title,
		description: apiTask.description,
		type: apiTask.type,
		priority: (apiTask.priority as TaskPriority) ?? 2,
		publisherName: apiTask.publisher_name,
		createdAt: apiTask.created_at,
		deadline: apiTask.deadline,
		tags: apiTask.tags ?? [],
		acceptedCount: apiTask.accepted_count,
		maxAcceptCount: apiTask.max_accept_count,
		isAccepted: apiTask.is_accepted ?? false,
		status: (apiTask.status as TaskStatus | undefined) ?? 'available',
	}
}
