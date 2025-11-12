import { createApp } from 'vue'
import App from './App.vue'
import './styles/app.css'
import './styles/theme.css'
import './styles/components/bottom-nav.css'
import './styles/components/calendar.css'
import './styles/pages/settings.css'
import './styles/pages/calendar.css'
import './styles/app-shell.css'

import { useTheme } from './ts/theme'

useTheme()

createApp(App).mount('#app')
