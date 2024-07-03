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
    const reachMap = new Map()
    const branchCount = Grid.fromRect(context.rect, () => 0)
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
    const ctx = {...context, basinGrid, reachMap, branchCount}
    new LandBasinFill(landBorders, ctx).complete()
    new WaterBasinFill(waterBorders, ctx).complete()
    return basinGrid
}


class BasinFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }
    getGrowth(fill) { return GROWTH }
    getReach(fill) { return Infinity }

    onInitFill(fill, fillPoint, neighbors) {
        const {layers, typeMap, reachMap} = fill.context
        let basinStartNeighbor = this.findBasinStart(fill, fillPoint, neighbors)
        const type = this.buildType(layers, basinStartNeighbor)
        typeMap.set(fill.id, type.id)
        reachMap.set(fill.id, type.reach)
        this.fillBaseData(fill, fillPoint, basinStartNeighbor)
    }

    findBasinStart(fill, fillPoint, neighbors) {
        const {layers} = fill.context
        const isLand = layers.surface.isLand(fillPoint)
        for (let neighbor of neighbors) {
            const isNeighborLand = layers.surface.isLand(neighbor)
            if (isLand && ! isNeighborLand || ! isLand && isNeighborLand) {
                return neighbor
            }
        }
    }

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid, branchCount} = fill.context
        // distance to source by point
        const currentDistance = distanceGrid.wrapGet(parentPoint)
        distanceGrid.wrapSet(fillPoint, currentDistance + 1)
        // update the parent point with one more branch
        branchCount.set(parentPoint, branchCount.get(parentPoint) + 1)
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

    buildType(layers, point) {}
}


class LandBasinFill extends BasinFill {
    buildType(layers, point) {
        if (layers.surface.isLake(point)) {
            return LakeBasin
        } else if (layers.surface.isSea(point)) {
            return SeaBasin
        }
        return OceanBasin
    }

    canFill(fill, fillPoint, parent) {
        const {
            layers, basinGrid, distanceGrid, reachMap, branchCount
        } = fill.context
        if (basinGrid.get(fillPoint) !== EMPTY) return false
        if (layers.surface.isWater(fillPoint)) return false
        if (branchCount.get(parent) >= 3) return false
        const currentDistance = distanceGrid.get(parent)
        return currentDistance < reachMap.get(fill.id)
    }
}


class WaterBasinFill extends BasinFill {
    buildType(layers, point) {
        return RiverBedBasin
    }

    canFill(fill, fillPoint, parent) {
        const {layers, basinGrid} = fill.context
        const isWater = layers.surface.isWater(fillPoint)
        return isWater && basinGrid.get(fillPoint) === EMPTY
    }
}
