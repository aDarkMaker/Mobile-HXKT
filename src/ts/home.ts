export interface Announcement {
	id: string
	title: string
	content: string
	publishTime: Date | string
	priority?: 'normal' | 'important' | 'urgent'
}

export interface BilibiliDynamic {
	id: string
	title: string
	content: string
	publishTime: Date | string
	author: string
	authorAvatar?: string
	images?: string[]
	link?: string
}
