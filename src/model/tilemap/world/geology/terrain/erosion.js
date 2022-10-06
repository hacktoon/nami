import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { PairMap } from '/src/lib/map'
import { Point } from '/src/lib/point'

import { Terrain } from './schema'


class ErosionFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const wrappedPoint = fill.context.terrainLayer.rect.wrap(point)
        fill.context.erodedPoints.set(...wrappedPoint, [fill.id, level])
    }

    isEmpty(fill, point) {
        const wrappedPoint = fill.context.terrainLayer.rect.wrap(point)
        const terrainId = fill.context.terrainLayer.get(wrappedPoint)
        const isLand = terrainId == Terrain.BASIN
        const isEmpty = ! fill.context.erodedPoints.has(...wrappedPoint)
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
        const context = {terrainLayer, erodedPoints: new PairMap()}
        const mapFill = new ErosionMultiFill(props.shorePoints.points, context)

        mapFill.fill()
        this.erodedPoints = context.erodedPoints
        this.rect = terrainLayer.rect
        this.basinCount = props.shorePoints.size
        console.log(this.basinCount);
    }

    get(point) {
        return this.erodedPoints.get(...this.rect.wrap(point))
    }
}

