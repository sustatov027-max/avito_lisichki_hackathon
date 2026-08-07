import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios'

import { useCurrentUserStore } from '@shared/model/current-user.store'

const options: CreateAxiosDefaults = {
	baseURL: '/api',
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
}

export const axiosClassic: AxiosInstance = axios.create(options)
export const axiosWithAuth: AxiosInstance = axios.create(options)

axiosWithAuth.interceptors.request.use(config => {
	const user = useCurrentUserStore.getState().user
	if (user) {
		config.headers['X-User-ID'] = user?.userId
	}
	return config
})
