class GlobalStore {
	activePopover: string | undefined = $state()
}

export const store = new GlobalStore()
