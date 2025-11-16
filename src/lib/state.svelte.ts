class GlobalStore {
	activePopover: string | null = $state(null)
}

export const store = new GlobalStore()
