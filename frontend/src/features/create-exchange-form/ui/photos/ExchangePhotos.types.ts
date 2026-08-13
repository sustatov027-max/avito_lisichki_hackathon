export type ExchangePhotosProps = {
	photos: File[]
	onRemove: (index: number) => void
}

export type ExchangePhotoProps = {
	photo: File
	index: number
	onRemove: (index: number) => void
}
