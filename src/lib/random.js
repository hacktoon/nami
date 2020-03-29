
export class Random {
    static set seed(value) {
        let seed = String(value)
        let numericSeed = Random._hashString(seed)
        Random.publicSeed = seed
        Random._currentSeed = Random._hash(numericSeed)
    }

    static get seed() {
        return Random.publicSeed
    }

    static _hash(seed) {
        let h = 61 ^ seed ^ seed >>> 16
        h += h << 3
        h = Math.imul(h, 668265261)
        h ^= h >>> 15
        return h >>> 0
    }

    static _hashString(string) {
        var h = 0, len = string.length, i = 0
        if (len > 0)
            while (i < len)
                h = (h << 5) - h + string.charCodeAt(i++) | 0
        return h
    }

    static chance(percentage) {
        let value = Random.float()
        return percentage >= value
    }

    static choice(items) {
        let index = Random.int(0, items.length-1)
        return items[index]
    }

    static int(lower=1, upper) {
        let num = Random.float()

        lower = parseInt(lower, 10)
        if (upper === undefined) {
            upper = lower
            lower = 0
        } else {
            upper = parseInt(upper, 10)
        }

        if (lower > upper) {
            [lower, upper] = [upper, lower]
        }
        return lower + Math.floor(num * (upper - lower + 1))
    }

    static floatRange(lower, upper) {
        let num = Random.float()
        if (lower > upper) {
            [lower, upper] = [upper, lower]
        }
        return lower + num * (upper - lower)
    }

    static float() {
        if (Random._currentSeed === undefined) {
            Random.seed = Number(new Date())
        }
        let s = Random._currentSeed
        Random._currentSeed = s + 1831565813 | 0
        let t = Math.imul(s ^ s >>> 15, 1 | s)
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
        return ((t ^ t >>> 14) >>> 0) / 2 ** 32
    }
}
