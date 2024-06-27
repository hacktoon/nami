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
    const layers = context.layers
    // const basin = new Map()
    const landBorders = new Map()
    const waterBorders = new Map()
    const maxReach = new Map()
    let basinId = 0
    const basinGrid = Grid.fromRect(context.rect, point => {
        if (layers.surface.isBorder(point)) {
            if (layers.surface.isLand(point))
                landBorders.set(basinId, point)
            else
                waterBorders.set(basinId, point)
            basinId++
        }
        return EMPTY
    })
    const ctx = {...context, basinGrid, maxReach}
    new LandBasinFill(landBorders, ctx).complete()
    new WaterBasinFill(waterBorders, ctx).complete()
    return basinGrid
}


class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }

    onInitFill(fill, fillPoint, neighbors) {
        const {layers, typeMap} = fill.context
        let startPoint = this.findBasinStart(fill, neighbors)
        typeMap.set(fill.id, this.buildType(layers, startPoint))
        this.fillBaseData(fill, fillPoint, startPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid} = fill.context
        // distance to source by point
        const currentDistance = distanceGrid.wrapGet(parentPoint)
        distanceGrid.wrapSet(fillPoint, currentDistance + 1)
        this.fillBaseData(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
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
        // update parent point erosion path
        if (Point.differs(fillPoint, fill.origin)) {
            const upstream = Point.directionBetween(parentPoint, fillPoint)
            directionMaskGrid.add(parentPoint, upstream)
        }
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

    findBasinStart(fill, neighbors) {}
    buildType(layers, point) {}
}


class LandBasinFill extends BasinFill {
    findBasinStart(fill, neighbors) {
        const {layers, maxReach} = fill.context
        for (let neighbor of neighbors) {
            if (layers.surface.isWater(neighbor)) {
                // Set basin max reach, given by water body area.
                // Lakes have a small reach, oceans have no limit
                // subtract 1 to start from zero
                const area = layers.surface.getArea(neighbor) - 1
                maxReach.set(fill.id, area)
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
            layers, basinGrid, distanceGrid, maxReach
        } = fill.context
        const isLand = layers.surface.isLand(fillPoint)
        const currentDistance = distanceGrid.get(parent)
        const inBasinReach = currentDistance < maxReach.get(fill.id)
        return inBasinReach && isLand && basinGrid.get(fillPoint) === EMPTY
    }
}


class WaterBasinFill extends BasinFill {
    findBasinStart(fill, neighbors) {
        const {layers} = fill.context
        // water point from where basin flows
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
        return isWater && basinGrid.get(fillPoint) === EMPTY
    }
}
