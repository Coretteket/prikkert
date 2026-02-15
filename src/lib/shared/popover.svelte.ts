import type { Placement } from '@floating-ui/dom'

const supportsPopover =
	typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.togglePopover === 'function'

const supportsAnchorPositioning = typeof CSS !== 'undefined' && CSS.supports('anchor-name', '--a')

const useNative = supportsPopover && supportsAnchorPositioning

type PositionArea =
	| `${'top' | 'bottom'}${'' | ' left' | ' right' | ' span-left' | ' span-right'}`
	| `${'left' | 'right'}${'' | ' top' | ' bottom' | ' span-top' | ' span-bottom'}`

type PopoverOptions = { positionArea?: PositionArea }

interface Popover {
	id: string
	isOpen: boolean
	triggerAttrs: Record<string, string | number | boolean | undefined>
	floatingAttrs: Record<string, string | number | boolean | undefined>
	closeAttrs: Record<string, string | undefined>
	triggerHandler: (node: HTMLElement) => (() => void) | void
	floatingHandler: (node: HTMLElement) => (() => void) | void
	closeHandler: (node: HTMLElement) => (() => void) | void
}

class NativePopover implements Popover {
	id: string
	isOpen: boolean = $state(false)
	triggerAttrs: Record<string, string | number | boolean | undefined>
	floatingAttrs: Record<string, string | number | boolean | undefined>
	closeAttrs: Record<string, string | undefined>

	#positionArea: PositionArea
	#anchorName: string

	constructor(options: PopoverOptions = {}) {
		this.#positionArea = options.positionArea ?? 'bottom'
		this.id = crypto.randomUUID()
		this.#anchorName = `--popover-${this.id.slice(0, 8)}`

		this.triggerAttrs = {
			popovertarget: this.id,
			style: `anchor-name: ${this.#anchorName};`,
		}

		this.floatingAttrs = {
			id: this.id,
			role: 'menu',
			popover: 'auto',
			style: [
				`position-anchor: ${this.#anchorName}`,
				`position-area: ${this.#positionArea}`,
				`position-try-fallbacks: flip-block, flip-inline`,
				`margin: 8px 0`,
				`width: max-content`,
			].join('; '),
		}

		this.closeAttrs = {
			popovertarget: this.id,
			popovertargetaction: 'hide',
		}
	}

	triggerHandler = () => {}
	floatingHandler = () => {}
	closeHandler = () => {}
}

function positionAreaToPlacement(area: PositionArea) {
	return area
		.replace(' span-left', '-end')
		.replace(' span-right', '-start')
		.replace(' span-top', '-end')
		.replace(' span-bottom', '-start')
		.replace(' left', '-start')
		.replace(' right', '-end')
		.replace(' ', '-') as Placement
}

class FallbackPopover implements Popover {
	#triggerEl: HTMLElement | undefined = undefined
	#floatingEl: HTMLElement | undefined = undefined

	id: string
	isOpen: boolean = $state(false)
	triggerAttrs: Record<string, string | number | boolean | undefined>
	floatingAttrs: Record<string, string | number | boolean | undefined>
	closeAttrs: Record<string, string | undefined> = {}

	#positionArea: PositionArea

	constructor(options: PopoverOptions = {}) {
		this.#positionArea = options.positionArea ?? 'bottom'
		this.id = crypto.randomUUID()

		this.triggerAttrs = $derived({
			'aria-haspopup': 'menu',
			'aria-expanded': this.isOpen,
			'aria-controls': this.isOpen ? this.id : undefined,
		})

		this.floatingAttrs = $derived({
			id: this.id,
			tabindex: -1,
			role: 'menu',
			style: this.isOpen
				? 'position: fixed; top: 0; left: 0; z-index: 1000; width: max-content; visibility: hidden;'
				: 'display: none;',
			'aria-hidden': !this.isOpen,
		})
	}

	#handleClick() {
		this.isOpen = !this.isOpen
	}

	#handleOutsideClick = (event: MouseEvent) => {
		if (
			!this.#triggerEl?.contains(event.target as Node) &&
			!this.#floatingEl?.contains(event.target as Node)
		) {
			this.isOpen = false
		}
	}

	#handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			this.isOpen = false
			this.#triggerEl?.focus()
		}
	}

	triggerHandler = (node: HTMLElement) => {
		this.#triggerEl = node

		const clickHandler = this.#handleClick.bind(this)
		node.addEventListener('click', clickHandler)
		node.addEventListener('keydown', this.#handleKeydown)

		return () => {
			node.removeEventListener('click', clickHandler)
			node.removeEventListener('keydown', this.#handleKeydown)
			this.#triggerEl = undefined
		}
	}

	floatingHandler = (node: HTMLElement) => {
		this.#floatingEl = node

		const cleanup = $effect.root(() => {
			$effect(() => {
				if (!this.isOpen) return

				document.addEventListener('click', this.#handleOutsideClick)

				let positionCleanup: (() => void) | undefined

				import('@floating-ui/dom').then(({ autoUpdate, computePosition, flip, offset, shift }) => {
					if (!this.isOpen || !this.#triggerEl || !this.#floatingEl) return

					positionCleanup = autoUpdate(this.#triggerEl, this.#floatingEl, async () => {
						if (!this.#triggerEl || !this.#floatingEl) return

						const { x, y } = await computePosition(this.#triggerEl, this.#floatingEl, {
							placement: positionAreaToPlacement(this.#positionArea),
							strategy: 'fixed',
							middleware: [offset({ mainAxis: 8 }), shift(), flip()],
						})

						Object.assign(this.#floatingEl.style, {
							left: `${x}px`,
							top: `${y}px`,
							position: 'fixed',
							visibility: 'visible',
						})
					})
				})

				return () => {
					document.removeEventListener('click', this.#handleOutsideClick)
					positionCleanup?.()
				}
			})
		})

		node.addEventListener('keydown', this.#handleKeydown)

		return () => {
			cleanup()
			node.removeEventListener('keydown', this.#handleKeydown)
			this.#floatingEl = undefined
		}
	}

	#closeClick = () => {
		this.isOpen = false
	}

	closeHandler = (node: HTMLElement) => {
		node.addEventListener('click', this.#closeClick)
		return () => node.removeEventListener('click', this.#closeClick)
	}
}

export function createPopover(options: PopoverOptions = {}): Popover {
	return useNative ? new NativePopover(options) : new FallbackPopover(options)
}
