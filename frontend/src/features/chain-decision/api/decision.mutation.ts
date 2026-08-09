import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

import { decisionServices } from '@features/chain-decision/api/decision.services'

import { useCurrentUserStore } from '@shared/model/current-user.store'

export const useChainDecision = () => {
	const user = useCurrentUserStore(state => state.user)

	const queryClient = useQueryClient()

	const { mutate: accept, isPending: isAcceptPending } = useMutation({
		mutationKey: ['decision-accept', user],
		mutationFn: (chainId: string) => decisionServices.acceptChain(chainId),
		onSuccess() {
			toast.success('Вы согласились с этой цепочкой')

			queryClient.invalidateQueries({ queryKey: ['exchanges'] })
			queryClient.invalidateQueries({ queryKey: ['chain', user?.userId] })
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data.error)
			} else {
				toast.error(error.message)
			}
		}
	})

	const { mutate: reject, isPending: isRejectPending } = useMutation({
		mutationKey: ['decision-reject', user],
		mutationFn: (chainId: string) => decisionServices.acceptChain(chainId),
		onSuccess() {
			toast.success('Вы отказались от цепочки')

			queryClient.invalidateQueries({ queryKey: ['exchanges'] })
			queryClient.invalidateQueries({ queryKey: ['chain', user?.userId] })
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data.error)
			} else {
				toast.error(error.message)
			}
		}
	})

	return { accept, isAcceptPending, reject, isRejectPending }
}
