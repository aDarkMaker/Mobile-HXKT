import { ref, watch } from 'vue'

export interface AccountProfile {
	avatar: string | null
	username: string
	nickname: string
	qq: string
}

const STORAGE_KEY = 'hxkt.account'
const DEFAULT_AVATAR = '../assets/img/default-avatar.png'

const account = ref<AccountProfile>({
	avatar: DEFAULT_AVATAR,
	username: '',
	nickname: '',
	qq: '',
})

function loadAccount() {
	if (typeof window === 'undefined') return
	const stored = window.localStorage.getItem(STORAGE_KEY)
	if (stored) {
		try {
			account.value = { ...account.value, ...JSON.parse(stored) }
		} catch {
			// ignore
		}
	}
}

function saveAccount() {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account.value))
}

watch(
	account,
	() => {
		saveAccount()
	},
	{ deep: true },
)

loadAccount()

export function useAccount() {
	const updateProfile = (data: Partial<AccountProfile>) => {
		account.value = { ...account.value, ...data }
	}

	const setAvatar = (avatarUrl: string | null) => {
		account.value.avatar = avatarUrl
	}

	const updatePassword = (oldPassword: string, newPassword: string) => {
		// TODO: 实际密码更新逻辑需要对接后端 API
		console.log('更新密码', { oldPassword, newPassword })
		return Promise.resolve()
	}

	return {
		account,
		updateProfile,
		setAvatar,
		updatePassword,
	}
}
