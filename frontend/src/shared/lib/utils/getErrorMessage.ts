import { isAxiosError } from 'axios'

type ApiError = { error: { code: string; message: string } }

export const getApiErrorMessage = (
	error: unknown,
	fallback = 'Что-то пошло не так'
) => {
	if (isAxiosError<ApiError>(error)) {
		return error.response?.data?.error?.message ?? fallback
	}
	if (error instanceof Error) return error.message
	return fallback
}
