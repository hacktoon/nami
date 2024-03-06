import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { PointMap } from '/src/lib/point/map'
import { Direction } from '/src/lib/direction'
import { PairSet } from '/src/lib/map'


const EMPTY = null


export function buildRouteMap(context) {
    const cities = [...context.capitalPoints, ...context.cityPoints]
    // used in block fill to detect other's fill id
    const fillGrid = Grid.fromRect(context.rect, () => EMPTY)
    // save fill directions of each origin (city) for route building
    const directionGrid = Grid.fromRect(context.rect, () => EMPTY)
    const roadSpecs = []
    // maps a fill id to a city point
    const fillOriginMap = new Map()
    //
    const fill = new RoadFill()
    fill.start(cities, {
        roadFillSet: new PairSet(),  // used for road fill tracking
        directionGrid,
        fillOriginMap,
        roadSpecs,
        fillGrid,
        ...context
    })
    buildRoads(roadSpecs, {fillOriginMap, directionGrid, ...context})
    return
}


function buildRoads(roadSpecs, context) {
    const roads = []
    const roadPatternMap = new PointMap()
    const {directionGrid, fillOriginMap} = context
    roadSpecs.forEach(spec => {
        const [idA, idB, originA, originB] = spec
        // city points are path target
        const targetA = fillOriginMap.get(idA)
        const targetB = fillOriginMap.get(idB)
        // initial directions at path origin
        const directionA = directionGrid.get(originA)
        const directionB = directionGrid.get(originB)

        const ids = [6, 90]
        const debug = ids.includes(idA) && ids.includes(idB)
        if (debug) {
            console.log([
                `A ${idA}: de ${originA} para ${targetA}: ${directionA.name}`,
                `B ${idB}: de ${originB} para ${targetB}: ${directionB.name}`,
            ].join("\n"));
        }
    })
}


function buildRoad() {

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

    onBlockedFill(fill, blockedPoint, parentPoint) {
        const {fillGrid, roadSpecs, roadFillSet} = fill.context
        const blockedId = fillGrid.get(blockedPoint)
        const parentId = fillGrid.get(parentPoint)
        const isSameFill = blockedId === parentId
        const hasRoad = (
            roadFillSet.has(blockedId, parentId)
            || roadFillSet.has(parentId, blockedId)
        )
        if (blockedId === EMPTY || isSameFill || hasRoad) return
        // set same value to both ids
        roadFillSet.add(blockedId, parentId)
        // store road specs
        roadSpecs.push([blockedId, parentId, blockedPoint, parentPoint])
    }
}

