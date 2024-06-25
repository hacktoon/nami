import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'
import { PointMap } from '/src/lib/point/map'

import {
    SeaBasin,
    LakeBasin,
    OceanBasin,
    RiverBedBasin,
} from './data'


const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others
const OFFSET_MIDDLE = 5
const OFFSET_RANGE = [1, 3]


export function buildBasin(context) {
    const basinMaxReach = new Map()
    const basinMaxDistance = new Map()
    const layers = context.layers
    const landBorders = []
    const waterBorders = []
    const originMap = new PointMap(context.rect)
    let basinId = 0
    const basinGrid = Grid.fromRect(context.rect, point => {
        if (layers.surface.isBorder(point)) {
            if (layers.surface.isLand(point))
                landBorders.push(point)
            else
                waterBorders.push(point)
            basinMaxDistance.set(basinId, 0)
            originMap.set(point, basinId)
            basinId++
        }
        return null
    })
    const ctx = {
        ...context,
        basinGrid,
        originMap,
        basinMaxReach,
        basinMaxDistance
    }
    new LandBasinFill(landBorders, ctx).completeFill()
    new WaterBasinFill(waterBorders, ctx).completeFill()
    return basinGrid
}


class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint, neighbors) {
        const {layers, typeMap, originMap} = fill.context
        let startPoint = this.findBasinStart(fill, neighbors)
        const basinId = originMap.get(fill.origin)
        typeMap.set(basinId, this.buildType(layers, startPoint))
        this.fillBaseData(fill, fillPoint, startPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid, originMap, basinMaxDistance} = fill.context
        // distance to source by point
        const basinId = originMap.get(fill.origin)
        const currentDistance = distanceGrid.wrapGet(parentPoint)
        const newDistance = currentDistance + 1
        distanceGrid.wrapSet(fillPoint, newDistance)
        if (newDistance > basinMaxDistance.get(basinId)) {
            basinMaxDistance.set(basinId, newDistance)
        }
        this.fillBaseData(fill, fillPoint, parentPoint)
    }

    fillBaseData(fill, fillPoint, parentPoint) {
        const {
            basinGrid, erosionGrid, originMap, directionMaskGrid,
            midpointIndexGrid, zoneRect
        } = fill.context
        const basinId = originMap.get(fill.origin)
        // set basin id to spread on fill
        basinGrid.wrapSet(fillPoint, basinId)
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        erosionGrid.wrapSet(fillPoint, direction.id)
        // update erosion path
        directionMaskGrid.add(fillPoint, direction)
        // update parent point erosion path
        if (Point.differs(fillPoint, fill.origin)) {
            const upstream = Point.directionBetween(parentPoint, fillPoint)
            directionMaskGrid.add(parentPoint, upstream)
        }
        // terrain offset to add variance
        const midpoint = buildMidpoint(direction)
        const midpointIndex = zoneRect.pointToIndex(midpoint)
        midpointIndexGrid.wrapSet(fillPoint, midpointIndex)
    }

    findBasinStart(fill, neighbors) {}
    buildType(layers, point) {}
}


class LandBasinFill extends BasinFill {
    getNeighbors(fill, parentPoint) {
        const {rect, dividePoints} = fill.context
        const adjacents = Point.around(parentPoint)
        // is basin divide (is fill border)?
        if (isDivide(fill.context, adjacents)) {
            const wrappedParentPoint = rect.wrap(parentPoint)
            dividePoints.add(wrappedParentPoint)
        }
        return adjacents
    }

    findBasinStart(fill, neighbors) {
        const {layers, originMap, basinMaxReach} = fill.context
        const basinId = originMap.get(fill.origin)
        // land point where basin flows
        for (let neighbor of neighbors) {
            if (layers.surface.isWater(neighbor)) {
                // set basin max reach, given by water body area
                // lakes have a small reach, oceans have no limit
                // start from zero
                const area = layers.surface.getArea(neighbor) - 1
                basinMaxReach.set(basinId, area)
                return neighbor
            }
        }
    }

    buildType(layers, point) {
        if (layers.surface.isLake(point)) {
            return LakeBasin.id
        } else if (layers.surface.isSea(point)) {
            return SeaBasin.id
        }
        return OceanBasin.id
    }

    canFill(fill, fillPoint, parent) {
        const {
            layers, basinGrid, distanceGrid, originMap, basinMaxReach
        } = fill.context
        const isLand = layers.surface.isLand(fillPoint)
        const basinId = originMap.get(fill.origin)
        const maxReach = basinMaxReach.get(basinId)
        const currentDistance = distanceGrid.get(parent)
        const inBasinReach = currentDistance < maxReach
        return inBasinReach && isLand && basinGrid.get(fillPoint) === null
    }
}


class WaterBasinFill extends BasinFill {
    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    findBasinStart(fill, neighbors) {
        const {
            layers, basinGrid, originMap, basinMaxReach, basinMaxDistance
        } = fill.context
        const basinId = originMap.get(fill.origin)
        // water point from where basin flows
        for (let neighbor of neighbors) {
            if (layers.surface.isLand(neighbor)) {
                const neighborBasinId = basinGrid.get(neighbor)
                // make reach the size of the land neighbor basin
                const basinSize = basinMaxDistance.get(neighborBasinId)
                const reach = basinMaxReach.get(neighborBasinId)
                basinMaxReach.set(basinId, basinSize > 2 ? reach : basinSize)
                return neighbor
            }
        }
    }

    buildType(layers, point) {
        return RiverBedBasin.id
    }

    canFill(fill, fillPoint, parent) {
        const {
            layers, basinGrid, distanceGrid, originMap, basinMaxReach
        } = fill.context
        const isWater = layers.surface.isWater(fillPoint)
        const basinId = originMap.get(fill.origin)
        const maxReach = basinMaxReach.get(basinId)
        const currentDistance = distanceGrid.get(parent)
        const inBasinReach = currentDistance < maxReach
        return inBasinReach && isWater && basinGrid.get(fillPoint) === null
    }
}


function buildMidpoint(direction) {
    // direction axis ([-1, 0], [1, 1], etc)
    const rand = (coordAxis) => {
        const offset = Random.int(...OFFSET_RANGE)
        const axisToggle = coordAxis === 0 ? Random.choice(-1, 1) : coordAxis
        return OFFSET_MIDDLE + (offset * axisToggle)
    }
    const x = rand(direction.axis[0])
    const y = rand(direction.axis[1])
    return [x, y]
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
