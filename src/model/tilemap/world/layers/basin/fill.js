import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'

import {
    SeaBasin,
    LakeBasin,
    ContinentBasin,
} from './data'


const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others
const OFFSET_MIDDLE = 5
const OFFSET_RANGE = [1, 3]


export function buildBasin(originPoints, context) {
    const fill = new BasinFill()
    const basinMaxReach = new Map()
    fill.start(originPoints, {...context, basinMaxReach})
}


class BasinFill extends ConcurrentFill {
    onInitFill(fill, fillPoint, neighbors) {
        const {
            rect, layers, basinMap, typeMap, distanceMap, erosionMap,
            terrainMidpointMap, midpointRect, basinMaxReach
        } = fill.context
        // water point where basin flows
        let basinMouth
        let basinType
        // check water neighbors
        for (let neighbor of neighbors) {
            if (layers.surface.isWater(neighbor)) {
                // detect basin type by water surface
                basinType = buildType(layers, neighbor)
                basinMouth = neighbor
                break
            }
        }
        // set basin type
        typeMap.set(fill.id, basinType)
        // set basin max reach, given by water body area
        const area = layers.surface.getArea(basinMouth)
        basinMaxReach.set(fill.id, area)
        // set erosion direction, use first water neighbor
        const direction = Point.directionBetween(fillPoint, basinMouth)
        erosionMap.set(fillPoint, direction.id)
        // set basin id to spread on fill
        basinMap.set(fillPoint, fill.id)
        // initial distance from mouth is 0
        distanceMap.set(fillPoint, 0)
        // terrain offset to add variance
        const terrainMidpoint = buildTerrainMidpoint(midpointRect, direction)
        terrainMidpointMap.set(fillPoint, terrainMidpoint)
    }

    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    getNeighbors(fill, parentPoint) {
        const {rect, dividePoints} = fill.context
        const adjacents = Point.adjacents(parentPoint)
        // is basin divide (is fill border)?
        if (isDivide(fill.context, adjacents)) {
            const wrappedParentPoint = rect.wrap(parentPoint)
            dividePoints.add(wrappedParentPoint)
        }
        return adjacents
    }

    canFill(fill, fillPoint, parent) {
        const {rect, layers, basinMap, distanceMap, basinMaxReach} = fill.context
        const point = rect.wrap(fillPoint)
        const isLand = layers.surface.isLand(fillPoint)
        const maxReach = basinMaxReach.get(fill.id)
        const currentDistance = distanceMap.get(parent)
        const inBasinReach = currentDistance < maxReach
        return inBasinReach && isLand && ! basinMap.has(point)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {
            rect, basinMap, distanceMap, erosionMap,
            terrainMidpointMap, midpointRect
        } = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        // distance to source by point
        const currentDistance = distanceMap.get(wrappedParentPoint)
        distanceMap.set(wrappedPoint, currentDistance + 1)
        // use basin value from parent point
        const parentBasin = basinMap.get(wrappedParentPoint)
        basinMap.set(wrappedPoint, parentBasin)
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        erosionMap.set(wrappedPoint, direction.id)
        // terrain offset to add variance
        const terrainMidpoint = buildTerrainMidpoint(midpointRect, direction)
        terrainMidpointMap.set(wrappedPoint, terrainMidpoint)
    }
}


function buildType(layers, point) {
    if (layers.surface.isLake(point)) {
        return LakeBasin.id
    } else if (layers.surface.isSea(point)) {
        return SeaBasin.id
    }
    return ContinentBasin.id
}


function buildTerrainMidpoint(midpointRect, direction) {
    // direction axis ([-1, 0], [1, 1], etc)
    const rand = (coordAxis) => {
        const offset = Random.int(...OFFSET_RANGE)
        const axisToggle = coordAxis === 0 ? Random.choice(-1, 1) : coordAxis
        return OFFSET_MIDDLE + (offset * axisToggle)
    }
    const x = rand(direction.axis[0])
    const y = rand(direction.axis[1])
    return midpointRect.pointToIndex([x, y])
}


function isDivide(context, neighbors) {
    const {rect, layers, erosionMap} = context
    // it's a river source if every neighbor is water
    let waterNeighborCount = 0
    let blockedCount = 0
    for(let neighbor of neighbors) {
        const isNeighborWater = layers.surface.isWater(neighbor)
        const isOccupied = erosionMap.has(rect.wrap(neighbor))
        waterNeighborCount += isNeighborWater ? 1 : 0
        blockedCount += (isNeighborWater || isOccupied) ? 1 : 0
    }
    const allNeighborsWater = waterNeighborCount === neighbors.length
    const allNeighborsBlocked = blockedCount === neighbors.length
    return allNeighborsWater || allNeighborsBlocked
}
