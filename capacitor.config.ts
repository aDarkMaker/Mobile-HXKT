import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
	appId: 'huaxiaoke.com',
	appName: 'HXKTerminal',
	webDir: 'dist',
	server: {
		allowNavigation: ['*'],
	},
	android: {
		allowMixedContent: true,
		captureInput: true,
	},
}

export default config
