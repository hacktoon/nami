import { Random } from "/lib/random"


export class RandomQueue {
	constructor(items) {
		this._queue = Array.from(items)
    }

	get size() {
		return this._queue.length
	}

	pop() {
        const length = this._queue.length
		if (length <= 0) {
			return null
        } else if (length == 1) {
			return this._queue.pop()
        } else {
			const i = Random.int(0, length - 1)
			const j = length - 1
            const swap = this._queue[i]
			this._queue[i] = this._queue[j]
            this._queue[j] = swap
        }
		return this._queue.pop()
    }
}
