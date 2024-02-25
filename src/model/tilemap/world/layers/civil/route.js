import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { PairMap } from '/src/lib/map'


const EMPTY = null


export function buildRouteMap(context) {
    const cities = [...context.capitalPoints, ...context.cityPoints]
    // used in block fill to detect other's fill id
    const fillGrid = Grid.fromRect(context.rect, () => EMPTY)
    // save directions to each city to build roads later
    const directionGrid = Grid.fromRect(context.rect, () => EMPTY)
    // maps a fill id to a city point
    const fillOriginMap = new Map()
    // ?
    const roadMiddleMap = new PairMap()
    const fill = new RoadFill()
    fill.start(cities, {
        fillGrid,
        directionGrid,
        roadMiddleMap,
        fillOriginMap,
        ...context
    })
    return
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
        const direction = 1
        // TODO ===================
        directionGrid.set(fillPoint, direction)
        fillGrid.set(fillPoint, fill.id)
        // if (Point.equals(fillPoint, [49,58])) {
        //     console.log("49,58", fill.id);
        // }
        // if (Point.equals(fillPoint, [43,56])) {
        //     console.log("43,56", fill.id);
        // }
    }

    canFill(fill, fillPoint) {
        const {layers, fillGrid} = fill.context
        const isLand = layers.surface.isLand(fillPoint)
        const isEmpty = fillGrid.get(fillPoint) === EMPTY
        return isLand && isEmpty
    }

    onBlockedFill(fill, blockedPoint, parentPoint) {
        const {rect, fillGrid, fillOriginMap, roadMiddleMap} = fill.context
        const blockedId = fillGrid.get(blockedPoint)
        const parentId = fillGrid.get(parentPoint)
        const isSameFill = blockedId === parentId
        const hasRoadBetween = roadMiddleMap.has(blockedId, parentId)
        if (isSameFill || hasRoadBetween) {
            return
        }
        // point on which both fills meet will be middle of road
        const meetingPoint = rect.wrap(parentPoint)
        // set same value to both ids
        const parentCityPoint = fillOriginMap.get(parentId)
        const blockedCityPoint = fillOriginMap.get(blockedId)
        roadMiddleMap.set(blockedId, parentId, meetingPoint)
        roadMiddleMap.set(parentId, blockedId, meetingPoint)

        const ids = [6, 90]
        const debug = ids.includes(blockedId) && ids.includes(parentId)
        if (debug) {
            // console.log([
            //     `fill ${parentCity} e fill ${blockedCity} em ${meetingPoint}`,
            // ].join("\n"));
            console.log(parentCityPoint," to ", blockedCityPoint);
        }
    }
}
