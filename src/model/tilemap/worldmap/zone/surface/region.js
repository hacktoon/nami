import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/geometry/point'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { EvenPointSampling } from '/src/lib/geometry/point/sampling'


const EMPTY = null
const REGION_SCALE = 2  // distance between region origins
const REGION_GROWTH = [2, 1]
const REGION_CHANCE = .1
const REGION_CENTER_SIZE = 7


export function buildRegionGridMap(context) {
    const {worldPoint, zoneRect} = context
    // create a grid with many regions fragmenting the zone map
    const regionGrid = Grid.fromRect(zoneRect, () => EMPTY)
    const origins = EvenPointSampling.create(zoneRect, REGION_SCALE)
    const originMap = new Map()
    // region id map to direction in zone rect
    const regionDirMap = new Map()
    // prepare fill map with fill id => fill origin
    // it's also a map of all regions
    const regionIdMap = new Map(origins.map((origin, id) => {
        const direction = getDirection(zoneRect, origin, REGION_CENTER_SIZE)
        regionDirMap.set(id, direction.id)

        // set the origin for each region
        originMap.set(id, origin)
        return [id, {origin}]
    }))
    const fillContext = {
        ...context,
        regionIdMap,
        regionGrid,
        regionDirMap,
    }
    new RegionFloodFill(regionIdMap, fillContext).complete()
    return {regionGrid, regionDirMap}
}


function getDirection(zoneRect, [x, y], centerSize) {
    // divides a zoneRect into a 3 x 3  grid of directions
    // decide the direction by the point in that rect
    const gridSize = zoneRect.width
    const borderSize = (gridSize - centerSize) / 2  // outer borders size
    const zoneX = x < borderSize ? -1 : (x >= gridSize - borderSize ? 1 : 0)
    const zoneY = y < borderSize ? -1 : (y >= gridSize - borderSize ? 1 : 0)
    return Direction.fromAxis(zoneX, zoneY)
}


class RegionFloodFill extends ConcurrentFill {
    getGrowth() { return Random.choiceFrom(REGION_GROWTH) }
    getChance() { return REGION_CHANCE }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - flood fill from borders to center
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        fill.context.regionGrid.set(fillPoint, fill.id)
    }
}