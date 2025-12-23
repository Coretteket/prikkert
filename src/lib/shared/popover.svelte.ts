import { autoUpdate, computePosition, type ComputePositionConfig } from '@floating-ui/dom'

export const store: { activePopover: string | undefined } = $state({ activePopover: undefined })

export class Popover {
	triggerEl: HTMLElement | undefined = undefined
	floatingEl: HTMLElement | undefined = undefined

	id: string
	isOpen: boolean
	triggerAttrs: Record<string, string | number | boolean | undefined>
	floatingAttrs: Record<string, string | number | boolean | undefined>

	constructor(private options: Partial<ComputePositionConfig> = {}) {
		this.id = crypto.randomUUID()

		this.isOpen = $derived(store.activePopover === this.id)

		this.triggerAttrs = $derived({
			'aria-haspopup': 'menu',
			'aria-expanded': this.isOpen,
			'aria-controls': this.isOpen ? this.id : undefined,
		})

		this.floatingAttrs = $derived({
			id: this.id,
			tabindex: -1,
			role: 'menu',
			style: 'position: absolute; top: 0; left: 0; z-index: 100; width: max-content;',
			'aria-hidden': !this.isOpen,
		})

		$effect(() => {
			if (!this.isOpen) return
			const clickHandler = this.#handleOutsideClick.bind(this)
			document.addEventListener('click', clickHandler)
			return () => document.removeEventListener('click', clickHandler)
		})
	}

	#handleClick() {
		store.activePopover = this.isOpen ? undefined : this.id
	}

	#handleOutsideClick(event: MouseEvent) {
		if (
			!this.triggerEl?.contains(event.target as Node) &&
			!this.floatingEl?.contains(event.target as Node)
		) {
			store.activePopover = undefined
		}
	}

	triggerHandler(node: HTMLElement) {
		this.triggerEl = node

		const clickHandler = this.#handleClick.bind(this)
		node.addEventListener('click', clickHandler)

		return () => {
			node.removeEventListener('click', clickHandler)
			this.triggerEl = undefined
		}
	}

	floatingHandler(node: HTMLElement) {
		this.floatingEl = node

		const cleanup = autoUpdate(this.triggerEl!, this.floatingEl, async () => {
			if (!this.triggerEl || !this.floatingEl) return

			const { x, y } = await computePosition(this.triggerEl, this.floatingEl, this.options)

			Object.assign(this.floatingEl.style, {
				left: `${x}px`,
				top: `${y}px`,
				position: 'absolute',
			})
		})

		return () => {
			cleanup()
			this.floatingEl = undefined
		}
	}

	open() {
		store.activePopover = this.id
	}

	close() {
		store.activePopover = undefined
	}
}
