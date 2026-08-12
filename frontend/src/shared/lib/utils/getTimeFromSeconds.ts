export const getTimeFromSeconds = (seconds: number) => {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	if (hours > 0) {
		return `${hours} ч ${minutes} мин`
	}

	return `${minutes} мин`
}
