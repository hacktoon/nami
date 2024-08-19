import { ConcurrentGridFill } from '/src/lib/floodfill/concurrent_grid'
import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/direction'
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
const JOINT_RANGE = [0, .3]


export function buildBasinGrid(baseContext) {
    const {rect, layers, typeMap, jointGrid} = baseContext
    const fillMap = new Map()
    const referenceMap = new Map()
    let basinId = 0
    // get surface border points and setup basin fill
    Grid.fromRect(rect, point => {
        jointGrid.set(point, Random.floatRange(...JOINT_RANGE))
        if (layers.surface.isBorder(point)) {
            const reference = getBasinReference(point, baseContext)
            const type = buildType(point, {...baseContext, reference})
            referenceMap.set(basinId, reference)
            fillMap.set(basinId, point)
            typeMap.set(basinId, type.id)
            basinId++
        }
    })
    const context = {...baseContext, referenceMap}
    // returns a grid storing basin ids
    return new BasinGridFill(fillMap, rect, context).complete()
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


class BasinGridFill extends ConcurrentGridFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    //if (Random.chance(fill.id % 2 === 0 ? .5 : .8))

    onInitFill(fill, fillPoint, neighbors) {
        const parentPoint = fill.context.referenceMap.get(fill.id)
        this.fillBaseData(fill, fillPoint, parentPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid, erosionGridMask} = fill.context
        // distance to source by point
        const currentDistance = distanceGrid.wrapGet(parentPoint)
        distanceGrid.wrapSet(fillPoint, currentDistance + 1)
        // update parent point erosion path
        const upstream = Point.directionBetween(parentPoint, fillPoint)
        erosionGridMask.add(parentPoint, upstream)
        this.fillBaseData(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        const {layers} = fill.context
        if (layers.surface.isWater(parentPoint)) {
            return Point.around(parentPoint)
        }
        return Point.adjacents(parentPoint)
    }

    fillBaseData(fill, fillPoint, parentPoint) {
        const {
            erosionGrid, erosionGridMask,
            midpointIndexGrid, zoneRect
        } = fill.context
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        erosionGrid.wrapSet(fillPoint, direction.id)
        // update erosion path
        erosionGridMask.add(fillPoint, direction)
        // terrain offset to add variance
        const midpoint = this.buildMidpoint(direction)
        const midpointIndex = zoneRect.pointToIndex(midpoint)
        midpointIndexGrid.wrapSet(fillPoint, midpointIndex)
    }

    canFill(fill, fillPoint, parentPoint) {
        const surfaceLayer = fill.context.layers.surface
        const sameType = surfaceLayer.get(fillPoint) === surfaceLayer.get(parentPoint)
        return sameType
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
