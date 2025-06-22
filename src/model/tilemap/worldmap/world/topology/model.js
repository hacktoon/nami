import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'


const ROAD_JOINT_RANGE = [.1, .9]
const RIVER_JOINT_RANGE = [.2, .8]


export function buildRoadJointGrid(rect) {
    return Grid.fromRect(rect, () => Random.floatRange(...ROAD_JOINT_RANGE))
}


export function buildRiverJointGrid(rect) {
    return Grid.fromRect(rect, () => Random.floatRange(...RIVER_JOINT_RANGE))
}


export function buildMidpointIndexGrid({rect, zoneRect}) {
    return Grid.fromRect(rect, () => {
        const x = Random.int(2, zoneRect.width - 3)  // avoid edges
        const y = Random.int(2, zoneRect.height - 3)
        return zoneRect.pointToIndex([x, y])
    })
}
