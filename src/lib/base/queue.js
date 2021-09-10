import { Random } from "/lib/base/random"

export class RandomQueue {
	constructor(array) {
		this.array = array ?? []
    }

	empty(self) {
		return self.array.length <= 0
    }

	push(item) {
        this.array.push(item)
    }

	pop() {
        const length = this.array.length

		if (length <= 0) {
			throw new Error('Cannot pop from empty array!')
        } else if (length == 1) {
			return this.array.pop()
        } else {
			const i = Random.int(0, length - 1)
			const j = length - 1
            const swap = this.array[i]
			this.array[i] = this.array[j]
            this.array[j] = swap
        }
		return this.array.pop()
    }
}
