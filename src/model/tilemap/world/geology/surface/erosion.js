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

    getNeighbors(fill, originPoint) {
        return Point.adjacents(originPoint)
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
    constructor(terrainLayer, props) {
        const context = {
            basinMap: new PairMap(),
            flowMap: new PairMap(),
            basins: new Set(),
            rect: props.rect,
            terrainLayer,
        }
        const mapFill = new ErosionMultiFill(props.shorePoints.points, context)

        mapFill.fill()
        this.basinMap = context.basinMap
        this.basinCount = props.shorePoints.size
        this.rect = props.rect
    }

    getBasin(point) {
        return this.basinMap.get(...this.rect.wrap(point))
    }

    getFlow(point) {
        return this.flowMap.get(...this.rect.wrap(point))
    }
}

