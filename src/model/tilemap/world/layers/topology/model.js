import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/geometry/point'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { EvenPointSampling } from '/src/lib/geometry/point/sampling'


const EMPTY = null
const ZONE_MIDDLE = .5
const OFFSET_RANGE = [.1, .3]
const JOINT_RANGE = [.2, .8]
const REGION_SCALE = [2, 3]


export function buildJointGrid(rect) {
    return Grid.fromRect(rect, () => Random.floatRange(...JOINT_RANGE))
}


export function buildMidpointGrid() {
    const rand = () => {
        const mod = Random.choice(-1, 1)
        const offset = Random.floatRange(...OFFSET_RANGE) * mod
        return ZONE_MIDDLE + offset
    }
    return [rand(), rand()]
}


export function buildRegionGrid(context) {
    const {zoneRect} = context
    // create a grid with many regions fragmenting the zone map
    const regionGrid = Grid.fromRect(zoneRect, () => EMPTY)
    const origins = EvenPointSampling.create(zoneRect, Random.choiceFrom(REGION_SCALE))
    const fillMap = new Map(origins.map((origin, id) => [id, {origin}]))
    const ctx = {...context, regionGrid}
    new RegionFloodFill(fillMap, ctx).complete()
    return regionGrid
}


class RegionFloodFill extends ConcurrentFill {
    getChance() {
        return Random.choice(.3, .2, .1)
    }

    getGrowth() {
        return Random.choice(3, 2)
    }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - carve from borders to inside
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, point, center) {
        fill.context.regionGrid.set(point, fill.id)
    }
}