import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { PairMap } from '/src/lib/map'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'

import { Terrain } from './schema'


class ErosionFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const wrappedPoint = fill.context.rect.wrap(point)
        fill.context.levelMap.set(...wrappedPoint, level)
        fill.context.basinMap.set(...wrappedPoint, fill.id)
        fill.context.basins.add(fill.id)
    }

    isEmpty(fill, point) {
        const wrappedPoint = fill.context.rect.wrap(point)
        const terrainId = fill.context.terrainLayer.get(wrappedPoint)
        const isLand = terrainId == Terrain.BASIN
        const isEmpty = ! fill.context.levelMap.has(...wrappedPoint)
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
}


export class ErosionLayer {
    constructor(terrainLayer, props) {
        const context = {
            levelMap: new PairMap(),
            basinMap: new PairMap(),
            basins: new Set(),
            rect: props.rect,
            terrainLayer,
        }
        const mapFill = new ErosionMultiFill(props.shorePoints.points, context)

        mapFill.fill()
        this.basinMap = context.basinMap
        this.levelMap = context.levelMap
        this.basinCount = props.shorePoints.size
        this.rect = props.rect
    }

    getErosionLevel(point) {
        return this.levelMap.get(...this.rect.wrap(point))
    }

    getBasin(point) {
        return this.basinMap.get(...this.rect.wrap(point))
    }
}

