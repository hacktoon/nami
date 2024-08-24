import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'

import {
    EndorheicSeaBasin,
    EndorheicLakeBasin,
    ExorheicBasin,
    OceanicBasin,
} from './data'


const FILL_CHANCE = .1  // chance of fill growing
const JOINT_CHANCE = .5  // chance of increase or decrease
const FILL_GROWTH = 10  // make fill basins grow bigger than others
const ZONE_MIDDLE = 5
const EMPTY = null
const OFFSET_RANGE = [1, 3]
const JOINT_RANGE = [0, 3]


export function buildBasinGrid(baseContext) {
    const {rect, layers, typeMap, jointGrid} = baseContext
    const fillMap = new Map()
    // maps the endorheic types for the total of fill skips
    const fillSkipMap = new Map([
        [EndorheicSeaBasin.id, 5],
        [EndorheicLakeBasin.id, 6],
    ])
    const referenceMap = new Map()
    let basinId = 0
    // get surface border points and setup basin fill
    const basinGrid = Grid.fromRect(rect, point => {
        const jointValue = Random.int(...JOINT_RANGE) * Random.chance(JOINT_CHANCE) ? 1 : -1
        jointGrid.set(point, jointValue)
        if (layers.surface.isBorder(point)) {
            const reference = getBasinReference(point, baseContext)
            const type = buildType(point, {...baseContext, reference})
            referenceMap.set(basinId, reference)
            fillMap.set(basinId, point)
            typeMap.set(basinId, type.id)
            basinId++
        }
        return EMPTY
    })
    const context = {...baseContext, fillSkipMap, basinGrid, referenceMap}
    // returns a grid storing basin ids
    new BasinGridFill(fillMap, context).complete()
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
    let type = isLand ? ExorheicBasin : OceanicBasin
    if (layers.surface.isLake(reference)) {
        type = EndorheicLakeBasin
    } else if (layers.surface.isSea(reference)) {
        type = EndorheicSeaBasin
    }
    return type
}


class BasinGridFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }
    getSkip(fill) {
        // skip fill n times on endorheic basins (lake, sea)
        const {typeMap, fillSkipMap} = fill.context
        const typeId = typeMap.get(fill.id)  // fill.id is basinId
        return fillSkipMap.get(typeId) ?? 0
    }

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
            erosionGrid, erosionGridMask, basinGrid,
            midpointIndexGrid, zoneRect
        } = fill.context
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        erosionGrid.wrapSet(fillPoint, direction.id)
        // update erosion path
        erosionGridMask.add(fillPoint, direction)
        basinGrid.set(fillPoint, fill.id)
        // terrain offset to add variance
        const midpoint = this.buildMidpoint(direction)
        const midpointIndex = zoneRect.pointToIndex(midpoint)
        midpointIndexGrid.wrapSet(fillPoint, midpointIndex)
    }

    isEmpty(fill, fillPoint) {
        return fill.context.basinGrid.get(fillPoint) === EMPTY
    }

    canFill(fill, fillPoint, parentPoint) {
        const {layers} = fill.context
        const target = layers.surface.get(fillPoint)
        const parent = layers.surface.get(parentPoint)
        return target.water === parent.water
    }

    buildMidpoint(direction) {
        // direction axis ([-1, 0], [1, 1], etc)
        const rand = (coordAxis) => {
            const offset = Random.int(...OFFSET_RANGE)
            const axisToggle = coordAxis === 0 ? Random.choice(-1, 1) : coordAxis
            return ZONE_MIDDLE + (offset * axisToggle)
        }
        return direction.axis.map(coord => rand(coord))
    }
}
