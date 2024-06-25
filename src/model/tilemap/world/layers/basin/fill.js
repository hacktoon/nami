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
    const layers = context.layers
    const landBorders = []
    const waterBorders = []
    const originMap = new PointMap(context.rect)
    let id = 0
    const basinGrid = Grid.fromRect(context.rect, point => {
        if (layers.surface.isBorder(point)) {
            if (layers.surface.isLand(point))
                landBorders.push(point)
            else
                waterBorders.push(point)
            originMap.set(point, id++)
        }
        return null
    })
    const ctx = {...context, basinGrid, originMap, basinMaxReach}
    new LandBasinFill(landBorders, ctx).completeFill()
    new WaterBasinFill(waterBorders, ctx).completeFill()
    return basinGrid
}


class BasinFill extends ConcurrentFill {
    onInitFill(fill, fillPoint, neighbors) {
        const {layers, typeMap, originMap, basinMaxReach} = fill.context
        let startPoint = this.findBasinStart(layers, neighbors)
        const id = originMap.get(fill.origin)
        typeMap.set(id, this.buildType(layers, startPoint))
        // set basin max reach, given by water body area
        // lakes have a small reach, oceans have no limit
        const area = layers.surface.getArea(startPoint)
        basinMaxReach.set(id, area)
        this.fillBaseData(fill, fillPoint, startPoint)
    }

    findBasinStart(layers, neighbors) {}

    buildType(layers, point) {}

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid} = fill.context
        // distance to source by point
        const currentDistance = distanceGrid.wrapGet(parentPoint)
        distanceGrid.wrapSet(fillPoint, currentDistance + 1)
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
        // this.updateErosionPath(fill.context, fillPoint, parentPoint)
    }

    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    getNeighbors(fill, parentPoint) {}

    canFill(fill, fillPoint, parent) {}

    updateErosionPath(context, point, parentPoint) {
        const {rect, layers, erosionGrid, directionMaskGrid} = context
        const erosion = erosionGrid.wrapGet(point)
        // set first tile according to which direction is flowing
        // directionMaskGrid.add(point, Direction.fromId(erosion))
        // // add flowCode for each neighbor that flows to this point
        // ignore adjacent water tiles
        // if (layers.surface.isWater(sidePoint)) return
        // neighbor basin flows here?
        const sideErosion = Direction.fromId(erosionGrid.wrapGet(parentPoint))
        // does side point points to this current point?
        const flowTargetPoint = Point.atDirection(parentPoint, sideErosion)
        if (Point.equals(point, flowTargetPoint)) {
            // directionMaskGrid.add(point, sideDirection)
        }
    }
}


class LandBasinFill extends BasinFill {
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

    findBasinStart(layers, neighbors) {
        // land point where basin flows
        for (let neighbor of neighbors) {
            if (layers.surface.isWater(neighbor)) {
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
        const id = originMap.get(fill.origin)
        const maxReach = basinMaxReach.get(id)
        const currentDistance = distanceGrid.get(parent)
        const inBasinReach = currentDistance < maxReach
        return inBasinReach && isLand && basinGrid.get(fillPoint) === null
    }
}


class WaterBasinFill extends BasinFill {
    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    findBasinStart(layers, neighbors) {
        // land point where basin flows
        for (let neighbor of neighbors) {
            if (layers.surface.isLand(neighbor)) {
                return neighbor
            }
        }
    }

    buildType(layers, point) {
        return RiverBedBasin.id
    }

    canFill(fill, fillPoint, parent) {
        const {layers, basinGrid} = fill.context
        const isWater = layers.surface.isWater(fillPoint)
        return isWater && basinGrid.get(fillPoint) === null
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
