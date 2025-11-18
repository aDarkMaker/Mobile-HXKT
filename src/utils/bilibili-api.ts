import type { BilibiliDynamic } from '../ts/home'

type BilibiliDynamicsResponse = BilibiliDynamic[] | { dynamics: BilibiliDynamic[] }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://118.195.243.30:8000'

async function requestBilibiliDynamics(): Promise<BilibiliDynamicsResponse> {
	const response = await fetch(`${API_BASE_URL}/bilibili/dynamics`)

	if (!response.ok) {
		const detail = await response
			.json()
			.catch(() => ({ detail: response.statusText || 'Bilibili dynamics request failed' }))
		throw new Error(detail.detail || `HTTP ${response.status}`)
	}

	return response.json()
}

export async function getBilibiliDynamics() {
	return requestBilibiliDynamics()
}
