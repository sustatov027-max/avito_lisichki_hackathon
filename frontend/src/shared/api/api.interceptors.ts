import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios'

const options: CreateAxiosDefaults = {
	baseURL: '/api',
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
}

export const axiosClassic: AxiosInstance = axios.create(options)
export const axiosWithAuth: AxiosInstance = axios.create(options)
