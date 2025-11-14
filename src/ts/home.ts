export interface Announcement {
	id: string
	title: string
	content: string
	publishTime: Date | string
	priority?: 'normal' | 'important' | 'urgent'
}

export interface BilibiliDynamic {
	封面?: string
	标题?: string
	播放量?: string
	弹幕数?: string
	点赞数: number
	评论数: number
	转发数: number
	link?: string
}
