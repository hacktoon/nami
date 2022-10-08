import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { PairMap } from '/src/lib/map'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'

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
        const isCurrentTerrain = terrainId == Terrain.BASIN
        const isEmpty = ! fill.context.basinMap.has(...wrappedPoint)
        return isCurrentTerrain && isEmpty
    }

    checkNeighbor(fill, sidePoint, centerPoint) {
        const flowMap = fill.context.flowMap
        const shorePoints = fill.context.shorePoints
        const wSidePoint = fill.context.rect.wrap(sidePoint)
        const wCenterPoint = fill.context.rect.wrap(centerPoint)
        const sideTerrain = fill.context.terrainLayer.get(wSidePoint)
        const isCurrentTerrain = sideTerrain == Terrain.BASIN
        // detect river mouth, point to straight neighbor
        if (shorePoints.has(wCenterPoint) && Terrain.isWater(sideTerrain)) {
            const angle = Point.angle(wCenterPoint, wSidePoint)
            const direction = Direction.fromAngle(angle)
            if(Direction.isCardinal(direction)) {
                flowMap.set(...wCenterPoint, wSidePoint)
            }
            return
        }
        if (flowMap.has(...wSidePoint))
            return
        if (isCurrentTerrain)
            flowMap.set(...wSidePoint, wCenterPoint)
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

