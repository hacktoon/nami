import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'

import {
    SeaBasin,
    LakeBasin,
    Ocean,
} from './data'


const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others
const OFFSET_MIDDLE = 5
const OFFSET_RANGE = [1, 3]


export function buildBasin(originPoints, context) {
    const basinMaxReach = new Map()
    const fill = new LandBasinFill(originPoints, {...context, basinMaxReach})
    fill.completeFill()
}


class LandBasinFill extends ConcurrentFill {
    onInitFill(fill, fillPoint, neighbors) {
        const {
            layers, basinGrid, typeMap, distanceMap, erosionMap,
            midpointIndexGrid, zoneRect, basinMaxReach
        } = fill.context
        let basinWaterMouth  // water point where basin flows
        let basinType
        // check water neighbors
        for (let neighbor of neighbors) {
            if (layers.surface.isWater(neighbor)) {
                // detect basin type by water surface
                basinType = buildType(layers, neighbor)
                basinWaterMouth = neighbor
                break
            }
        }
        // set basin type
        typeMap.set(fill.id, basinType)
        // set basin max reach, given by water body area
        // lakes have a small reach, oceans have no limit
        const area = layers.surface.getArea(basinWaterMouth)
        basinMaxReach.set(fill.id, area)
        // set erosion direction, use first water neighbor
        const direction = Point.directionBetween(fillPoint, basinWaterMouth)
        erosionMap.set(fillPoint, direction.id)
        // set basin id to spread on fill
        basinGrid.set(fillPoint, fill.id)
        // initial distance from mouth is 0
        distanceMap.set(fillPoint, 0)
        // terrain offset to add variance
        const midpointIndex = buildTerrainMidpoint(zoneRect, direction)
        midpointIndexGrid.set(fillPoint, midpointIndex)
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
        const {rect, layers, basinGrid, distanceMap, basinMaxReach} = fill.context
        const isLand = layers.surface.isLand(fillPoint)
        const maxReach = basinMaxReach.get(fill.id)
        const currentDistance = distanceMap.get(parent)
        const inBasinReach = currentDistance < maxReach
        return inBasinReach && isLand && ! basinGrid.get(fillPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {
            rect, basinGrid, distanceMap, erosionMap,
            midpointIndexGrid, zoneRect
        } = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        // distance to source by point
        const currentDistance = distanceMap.get(wrappedParentPoint)
        distanceMap.set(wrappedPoint, currentDistance + 1)
        // use basin value from parent point
        const parentBasin = basinGrid.get(parentPoint)
        basinGrid.set(wrappedPoint, parentBasin)
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        erosionMap.set(wrappedPoint, direction.id)
        // terrain offset to add variance
        const midpointIndex = buildTerrainMidpoint(zoneRect, direction)
        midpointIndexGrid.set(wrappedPoint, midpointIndex)
    }
}


function buildType(layers, point) {
    if (layers.surface.isLake(point)) {
        return LakeBasin.id
    } else if (layers.surface.isSea(point)) {
        return SeaBasin.id
    }
    return Ocean.id
}


function buildTerrainMidpoint(zoneRect, direction) {
    // direction axis ([-1, 0], [1, 1], etc)
    const rand = (coordAxis) => {
        const offset = Random.int(...OFFSET_RANGE)
        const axisToggle = coordAxis === 0 ? Random.choice(-1, 1) : coordAxis
        return OFFSET_MIDDLE + (offset * axisToggle)
    }
    const x = rand(direction.axis[0])
    const y = rand(direction.axis[1])
    return zoneRect.pointToIndex([x, y])
}


function isDivide(context, neighbors) {
    const {rect, layers, basinGrid} = context
    // it's a river source if every neighbor is water
    let waterNeighborCount = 0
    let blockedCount = 0
    for(let neighbor of neighbors) {
        const isNeighborWater = layers.surface.isWater(neighbor)
        const isOccupied = Boolean(basinGrid.wrapGet(neighbor))
        waterNeighborCount += isNeighborWater ? 1 : 0
        blockedCount += (isNeighborWater || isOccupied) ? 1 : 0
    }
    const allNeighborsWater = waterNeighborCount === neighbors.length
    const allNeighborsBlocked = blockedCount === neighbors.length
    return allNeighborsWater || allNeighborsBlocked
}
