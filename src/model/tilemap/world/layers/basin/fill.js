import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'

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
const EMPTY = null


export function buildBasin(context) {
    const {layers, typeMap, rect} = context
    // const basin = new Map()
    const landBorders = new Map()
    const waterBorders = new Map()
    const referenceMap = new Map()
    const skipMap = new Map()
    const branchCount = Grid.fromRect(rect, () => 0)
    let basinId = 0
    // init grid with basin id
    const basinGrid = Grid.fromRect(rect, point => {
        if (layers.surface.isBorder(point)) {
            if (layers.surface.isLand(point)) {
                landBorders.set(basinId, point)
            } else {
                waterBorders.set(basinId, point)
            }
            const reference = getBasinReference(point, context)
            const type = buildType(point, {...context, reference})
            referenceMap.set(basinId, reference)
            skipMap.set(basinId, type.reach)
            typeMap.set(basinId, type.id)
            // set parentPoint for origin
            basinId++
        }
        return EMPTY
    })
    const ctx = {...context, basinGrid, skipMap, referenceMap, branchCount}
    new LandBasinFill(landBorders, ctx).complete()
    new WaterBasinFill(waterBorders, ctx).complete()
    return basinGrid
}


function getBasinReference(point, context) {
    const {layers} = context
    const isLand = layers.surface.isLand(point)
    for (let neighbor of Point.adjacents(point)) {
        const isNeighborLand = layers.surface.isLand(neighbor)
        if (isLand && ! isNeighborLand || ! isLand && isNeighborLand) {
            return neighbor
        }
    }
}


function buildType(point, context) {
    const {layers, reference} = context
    const isLand = layers.surface.isLand(point)
    let type = isLand ? OceanBasin : RiverBedBasin
    if (layers.surface.isLake(reference)) {
        type = LakeBasin
    } else if (layers.surface.isSea(reference)) {
        type = SeaBasin
    }
    return type
}


class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint, neighbors) {
        const parentPoint = fill.context.referenceMap.get(fill.id)
        this.fillBaseData(fill, fillPoint, parentPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid, branchCount, directionMaskGrid} = fill.context
        // distance to source by point
        const currentDistance = distanceGrid.wrapGet(parentPoint)
        distanceGrid.wrapSet(fillPoint, currentDistance + 1)
        // update the parent point with one more branch
        const parentBranchCount = branchCount.get(parentPoint)
        branchCount.set(parentPoint, parentBranchCount + 1)
        // update parent point erosion path
        const upstream = Point.directionBetween(parentPoint, fillPoint)
        directionMaskGrid.add(parentPoint, upstream)
        this.fillBaseData(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        const chance = Random.chance(fill.id % 2 === 0 ? .4 : .8)
        return chance ? Point.around(parentPoint) : Point.adjacents(parentPoint)
    }

    fillBaseData(fill, fillPoint, parentPoint) {
        const {
            basinGrid, erosionGrid, directionMaskGrid,
            midpointIndexGrid, zoneRect
        } = fill.context
        // set basin id to spread on fill
        basinGrid.wrapSet(fillPoint, fill.id)
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        erosionGrid.wrapSet(fillPoint, direction.id)
        // update erosion path
        directionMaskGrid.add(fillPoint, direction)
        // terrain offset to add variance
        const midpoint = this.buildMidpoint(direction)
        const midpointIndex = zoneRect.pointToIndex(midpoint)
        midpointIndexGrid.wrapSet(fillPoint, midpointIndex)
    }

    buildMidpoint(direction) {
        // direction axis ([-1, 0], [1, 1], etc)
        const rand = (coordAxis) => {
            const offset = Random.int(...OFFSET_RANGE)
            const axisToggle = coordAxis === 0 ? Random.choice(-1, 1) : coordAxis
            return OFFSET_MIDDLE + (offset * axisToggle)
        }
        return direction.axis.map(coord => rand(coord))
    }
}


class LandBasinFill extends BasinFill {
    getSkip(fill) {
        return fill.context.skipMap.get(fill.id) ?? 0
    }

    canFill(fill, fillPoint, parent) {
        const {layers, basinGrid, branchCount} = fill.context
        if (basinGrid.get(fillPoint) !== EMPTY) return false
        if (layers.surface.isWater(fillPoint)) return false
        if (branchCount.get(parent) >= 3) return false
        return true
    }
}


class WaterBasinFill extends BasinFill {
    canFill(fill, fillPoint, parent) {
        const {layers, basinGrid} = fill.context
        const isWater = layers.surface.isWater(fillPoint)
        return isWater && basinGrid.get(fillPoint) === EMPTY
    }
}
