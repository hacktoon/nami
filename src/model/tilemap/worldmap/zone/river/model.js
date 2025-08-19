import { PointSet } from '/src/lib/geometry/point/set'
import { Point } from '/src/lib/geometry/point'
import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { clamp } from '/src/lib/function'


const MEANDER = 2


export function buildRiverGrid(context) {
    // reads the wire data and create points for zone grid
    const {world, worldPoint, zoneRect} = context
    const points = new PointSet(zoneRect)
    if (! (world.river.has(worldPoint) || world.surface.isWater(worldPoint))) {
        return points
    }
    const river = world.river.get(worldPoint)
    const basin = world.basin.get(worldPoint)
    const source = basin.midpoint
    const midSize = Math.floor(zoneRect.width / 2)
    for(let direction of basin.directionBitmap) {
        const parentPoint = Point.atDirection(worldPoint, direction)
        const isParentLand = world.surface.isLand(parentPoint)
        if (isParentLand && ! world.river.has(parentPoint))
            continue
        const target = [
            midSize + (midSize * direction.axis[0]),
            midSize + (midSize * direction.axis[1])
        ]
        const distance = Math.floor(Point.distance(source, target))
        const pointsTooClose = distance < midSize
        const distortion = pointsTooClose ? 1 : MEANDER
        midpointDisplacement(source, target, distortion, point => {
            const [x, y] = point
            points.add([
                clamp(x, 0, zoneRect.width - 1),
                clamp(y, 0, zoneRect.height - 1),
            ])
        })
    }
    return points
}


// export function buildRiver2(context) {
//     const {worldPoint, zoneRect} = context
//     // create a grid with many regions fragmenting the zone map
//     const regionGrid = Grid.fromRect(zoneRect, () => EMPTY)
//     const origins = EvenPointSampling.create(zoneRect, REGION_SCALE)
//     // region id map to direction in zone rect
//     const regionDirMap = new Map()
//     // prepare fill map with fill id => fill origin
//     // it's also a map of all regions
//     const regionIdMap = new Map(origins.map((origin, id) => {
//         return [id, {origin}]
//     }))
//     const fillContext = {
//         ...context,
//         regionIdMap,
//         regionGrid,
//         regionDirMap,
//     }
//     new RegionFloodFill(regionIdMap, fillContext).complete()
//     return {regionGrid, regionDirMap}
// }
// class RiverFloodFill extends ConcurrentFill {
//     getGrowth() { return Random.choiceFrom(REGION_GROWTH) }
//     getChance() { return REGION_CHANCE }

//     getNeighbors(fill, parentPoint) {
//         const rect = fill.context.zoneRect
//         const points = Point.adjacents(parentPoint)
//         // avoid wrapping in zone rect - flood fill from borders to center
//         return points.filter(p => rect.isInside(p))
//     }

//     isEmpty(fill, fillPoint) {
//         return fill.context.regionGrid.get(fillPoint) === EMPTY
//     }

//     onFill(fill, fillPoint) {
//         fill.context.regionGrid.set(fillPoint, fill.id)
//     }
// }