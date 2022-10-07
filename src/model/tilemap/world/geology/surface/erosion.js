import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { PairMap } from '/src/lib/map'
import { Point } from '/src/lib/point'

import { Terrain } from './schema'


class ErosionFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const wrappedPoint = fill.context.rect.wrap(point)
        fill.context.basinMap.set(...wrappedPoint, fill.id)
        fill.context.basins.add(fill.id)
    }

    isEmpty(fill, point) {
        const wrappedPoint = fill.context.rect.wrap(point)
        const terrainId = fill.context.terrainLayer.get(wrappedPoint)
        const isLand = terrainId == Terrain.BASIN
        const isEmpty = ! fill.context.basinMap.has(...wrappedPoint)
        return isLand && isEmpty
    }

    checkNeighbor(fill, sidePoint, centerPoint) {
        const wrappedSidePoint = fill.context.rect.wrap(sidePoint)
        if (fill.context.flowMap.has(...wrappedSidePoint))
            return
        const wrappedCenterPoint = fill.context.rect.wrap(centerPoint)
        fill.context.flowMap.set(...wrappedSidePoint, wrappedCenterPoint)
    }

    getNeighbors(fill, originPoint) {
        return Point.around(originPoint)
    }
}


class ErosionMultiFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, ErosionFloodFill, context)
    }

    getChance(fill, origin) { return .2 }
    getGrowth(fill, origin) { return 3 }
}


export class ErosionLayer {
    constructor(terrainLayer, oceanMap, props) {
        const context = {
            shorePoints: props.shorePoints,
            flowMap: new PairMap(),
            basinMap: new PairMap(),
            basins: new Set(),
            rect: props.rect,
            terrainLayer,
            oceanMap,
        }
        const mapFill = new ErosionMultiFill(props.shorePoints.points, context)

        mapFill.fill()
        this.basinMap = context.basinMap
        this.flowMap = context.flowMap
        this.basinCount = props.shorePoints.size
        this.rect = props.rect
    }

    getBasin(point) {
        return this.basinMap.get(...this.rect.wrap(point))
    }

    getFlowTarget(point) {
        return this.flowMap.get(...this.rect.wrap(point))
    }
}

