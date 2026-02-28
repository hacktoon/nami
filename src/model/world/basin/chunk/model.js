import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { EvenPointSampling } from '/src/lib/geometry/point/sampling'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointMap } from '/src/lib/geometry/point/map'
import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Random } from '/src/lib/random'
import { Grid } from '/src/lib/grid'


const MEANDER = 2
const EMPTY = null
const REGION_SCALE = 3  // distance between region origins
const REGION_GROWTH = [2, 1]
const REGION_CHANCE = .1

export const TYPE_LAND = 1
export const TYPE_WATER = 2
export const TYPE_RIVER = 3
export const TYPE_CURRENT = 4
export const TYPE_MARGIN = 5


export function buildModel(context) {
    // reads the wire data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = context
    const {regionGrid, borderRegions} = buildRegionModel(context)
    const pointMaskMap = buildPointMaskMap(context)
    // const river = world.river.get(worldPoint)
    // const basin = world.basin.get(worldPoint)
    return Grid.fromRect(chunkRect, chunkPoint => {
        const regionId = regionGrid.get(chunkPoint)
        const isCenterRegion = ! borderRegions.has(regionId)
        const isLand = world.surface.isLand(worldPoint)
        const isEroded = pointMaskMap.has(chunkPoint)
        if (chunk.surface.isLand(chunkPoint)) {
            return isEroded ? TYPE_RIVER : TYPE_LAND
        } else {
            if (isLand && isCenterRegion) return TYPE_LAND
            return isEroded ? TYPE_CURRENT : TYPE_WATER
        }
    })
}


function buildPointMaskMap(baseContext) {
    // reads the direction bitmask data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = baseContext
    const pointMaskMap = new PointMap(chunkRect)
    const basin = world.basin.get(worldPoint)
    const midSize = Math.floor(chunk.size / 2)
    const source = basin.midpoint
    for(let direction of basin.directionBitmap) {
        const parentPoint = Point.atDirection(worldPoint, direction)
        const sideBasin = world.basin.get(parentPoint)
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        const target = direction.axis.map(coord => {
            if (coord < 0) return 0
            if (coord > 0) return chunk.size - 1
            return avgJoint
        })
        const distance = Point.distance(source, target)
        const pointsTooClose = distance < midSize
        const distortion = pointsTooClose ? 0 : MEANDER
        midpointDisplacement(chunkRect, source, target, distortion, point => {
            pointMaskMap.set(point, TYPE_RIVER)
        })
    }
    return pointMaskMap
}

//  code for marking chunk corners
// for (let dir of cornerBitmap) {
//     const chunkPoint = dir.axis.map(coord => coord > 0 ? chunkSize-1 : 0)
//     fillMap.set(id++, {origin: chunkPoint, basinLevel: 1})
// }


function generateFlowPath(context, source, target, direction) {
    const {chunkRect, pointMaskMap} = context
    const deltaX = Math.abs(source[0] - target[0])
    const deltaY = Math.abs(source[1] - target[1])
    const fixedAxis = deltaX > deltaY ? 0 : 1  // 0 for x, 1 for y
    const displacedAxis = fixedAxis === 0 ? 1 : 0
    // distance between source and target to fill with path
    const size = Math.abs(target[fixedAxis] - source[fixedAxis])
    const points = [source]
    let current = source
    pointMaskMap.set(target, direction.id)
    const [tx, ty] = target
    while (Point.differs(current, target)) {
        let [x, y] = current
        const [cx, cy] = current
        if (Random.chance(.8))
            x = cx > tx ? cx - 1 : (cx < tx ? cx + 1 : cx)
        if (Random.chance(.8))
            y = cy > ty ? cy - 1 : (cy < ty ? cy + 1 : cy)
        // console.log(current);
        current = [x, y]
        pointMaskMap.set(current, direction.id)
    }
    return points
}


function buildRegionModel(context) {
    // Generate a boolean grid (land or water)
    const {worldPoint, world, rect, chunkRect} = context
    // Each chunk point is a region ID
    const regionGrid = Grid.fromRect(chunkRect, () => EMPTY)
    const origins = EvenPointSampling.create(chunkRect, REGION_SCALE)
    const borderRegions = new Set()
    // prepare fill map with fill id => fill origin
    // it's also a map of all regions
    const fillMap = new Map(origins.map((origin, id) => [id, {origin}]))
    const fillContext = {...context, regionGrid, borderRegions}
    // fill grid
    new RegionFloodFill(chunkRect, fillMap, fillContext).complete()
    return {regionGrid, borderRegions}
    // return Grid.fromRect(chunkRect, chunkPoint => {
    //     const regionId = regionGrid.get(chunkPoint)
    //     // if (! borderRegions.has(regionId)) {
    //     //     // not on chunk border regions, same as world map
    //     //     return isLand ? REGION_LAND : REGION_WATER
    //     // }
    // })
}


class RegionFloodFill extends ConcurrentFill {
    getGrowth() { return Random.choiceFrom(REGION_GROWTH) }
    getChance() { return REGION_CHANCE }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.chunkRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in chunk rect - flood fill from borders to center
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        const {chunkRect, regionGrid, borderRegions} = fill.context
        if (chunkRect.isEdge(fillPoint)) {
            borderRegions.add(fill.id)
        }
        regionGrid.set(fillPoint, fill.id)
    }
}