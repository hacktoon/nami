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
			const lastIndex = length - 1
			const randomIndex = Random.int(0, lastIndex)
            const swap = this._queue[randomIndex]
			this._queue[randomIndex] = this._queue[lastIndex]
            this._queue[lastIndex] = swap
        }
		return this._queue.pop()
    }
}
