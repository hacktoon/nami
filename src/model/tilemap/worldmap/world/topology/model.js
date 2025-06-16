import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'


const OFFSET_RANGE = [.01, .99]
const JOINT_RANGE = [.2, .8]


export function buildJointGrid(rect) {
    return Grid.fromRect(rect, () => Random.floatRange(...JOINT_RANGE))
}


export function buildMidpointGrid(context) {
    return Grid.fromRect(context.rect, () => {
        return Random.floatRange(...OFFSET_RANGE)
    })
}
