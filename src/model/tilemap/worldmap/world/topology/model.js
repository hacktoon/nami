import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'


const ZONE_MIDDLE = .5
const OFFSET_RANGE = [.1, .3]
const JOINT_RANGE = [.2, .8]


export function buildJointGrid(rect) {
    return Grid.fromRect(rect, () => Random.floatRange(...JOINT_RANGE))
}


export function buildMidpointGrid(context) {
    const {zoneRect, rect} = context
    const randPosition = () => {
        const value = Random.floatRange(...OFFSET_RANGE)
        const offset = value * Random.choice(-1, 1)
        return ZONE_MIDDLE + offset
    }
    return Grid.fromRect(rect, () => {
        const midpoint = [randPosition(), randPosition()]
        return zoneRect.pointToIndex(midpoint)
    })
}
