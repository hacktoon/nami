import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'


const JOINT_RANGE = [.2, .8]


export function buildJointGrid(rect) {
    return Grid.fromRect(rect, () => Random.floatRange(...JOINT_RANGE))
}


export function buildMidpointIndexGrid({rect, zoneRect}) {
    return Grid.fromRect(rect, () => {
        const x = Random.int(2, zoneRect.width - 3)  // avoid edges
        const y = Random.int(2, zoneRect.height - 3)
        return zoneRect.pointToIndex([x, y])
    })
}
