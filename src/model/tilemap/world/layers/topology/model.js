import { Random } from '/src/lib/random'


const MIDDLE = .5
const OFFSET_RANGE = [.1, .3]


export function buildMidpoint() {
    const rand = () => {
        const mod = Random.choice(-1, 1)
        const offset = Random.floatRange(...OFFSET_RANGE) * mod
        return MIDDLE + offset
    }
    return [rand(), rand()]
}
