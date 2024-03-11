import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { PointMap } from '/src/lib/point/map'
import { PairSet } from '/src/lib/map'

import { DirectionBitMask } from '/src/model/tilemap/lib/bitmask'


const EMPTY = null


export function buildRouteMap(context) {
    const cities = [...context.capitalPoints, ...context.cityPoints]
    // used in block fill to detect other's fill id
    const fillGrid = Grid.fromRect(context.rect, () => EMPTY)
    // save fill directions of each origin (city) for route building
    const directionGrid = Grid.fromRect(context.rect, () => EMPTY)
    const roadSpecs = []
    // used for road fill tracking
    const roadFillSet = new PairSet()
    // maps a fill id to a city point
    const fillOriginMap = new Map()
    const roadContext = {
        roadFillSet,
        directionGrid,
        fillOriginMap,
        roadSpecs,
        fillGrid,
        ...context
    }
    const fill = new RoadFill()
    fill.start(cities, roadContext)
    buildRoads(roadSpecs, roadContext)
    return
}


function buildRoads(roadSpecs, context) {
    const roads = []
    const roadPatternMap = new PointMap()
    roadSpecs.forEach((spec) => {
        const [originA, targetA, originB, targetB] = spec
        const directionA = Point.directionBetween(originA, originB)
        const codeA = roadPatternMap.get(originA) ?? 0
        const bitmaskA = new DirectionBitMask(codeA)
        // buildSemiRoute(originA, targetA, context)

        const directionB = Point.directionBetween(originB, originA)
        const codeB = roadPatternMap.get(originB) ?? 0
        const bitmaskB = new DirectionBitMask(codeB)
        // buildSemiRoute(originA, targetA, context)
        if (Point.equals(originA, [46,57]) && Point.equals(originB, [46,56])) {
            console.log([
                `A de ${originA} para ${targetA}: ${directionA.name}`,
                `B de ${originB} para ${targetB}: ${directionB.name}`,
            ].join("\n"));
        }
    })
}


function buildSemiRoute(origin, target, context) {
    const {directionGrid, fillOriginMap} = context
    const directionA = directionGrid.get(origin)
}


class RoadFill extends ConcurrentFill {
    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const {fillOriginMap, fillGrid} = fill.context
        // map the fill to the city point
        fillOriginMap.set(fill.id, fillPoint)
        fillGrid.set(fillPoint, fill.id)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {directionGrid, fillGrid} = fill.context
        const direction = Point.directionBetween(fillPoint, parentPoint)
        directionGrid.set(fillPoint, direction)
        fillGrid.set(fillPoint, fill.id)
    }

    canFill(fill, fillPoint) {
        const {layers, fillGrid} = fill.context
        const isLand = layers.surface.isLand(fillPoint)
        const isEmpty = fillGrid.get(fillPoint) === EMPTY
        return isLand && isEmpty
    }

    onBlockedFill(fill, pointA, pointB) {
        const {fillGrid, fillOriginMap, roadSpecs, roadFillSet} = fill.context
        const blockedFillId = fillGrid.get(pointA)
        const parentFillId = fillGrid.get(pointB)
        const isSameFill = blockedFillId === parentFillId
        const hasRoad = (
            roadFillSet.has(blockedFillId, parentFillId)
            || roadFillSet.has(parentFillId, blockedFillId)
        )
        if (blockedFillId === EMPTY || isSameFill || hasRoad) return
        // set same value to both ids
        roadFillSet.add(blockedFillId, parentFillId)
        // create road specs
        const targetA = fillOriginMap.get(blockedFillId)
        const targetB = fillOriginMap.get(parentFillId)
        // origin a, target a, origin b, target b
        roadSpecs.push([pointA, targetA, pointB, targetB])
    }
}

