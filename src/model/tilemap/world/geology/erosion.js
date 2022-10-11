import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'

import { Terrain } from './data'


class ErosionFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const wrappedPoint = fill.context.rect.wrap(point)
        fill.context.basinMap.set(...wrappedPoint, fill.id)
    }

    isEmpty(fill, point) {
        const wrappedPoint = fill.context.rect.wrap(point)
        const terrainId = fill.context.terrainLayer.get(wrappedPoint)
        const isCurrentTerrain = terrainId == fill.context.terrain
        const isEmpty = ! fill.context.basinMap.has(...wrappedPoint)
        return isCurrentTerrain && isEmpty
    }

    getNeighbors(fill, originPoint) {
        return Point.around(originPoint)
    }

    checkNeighbor(fill, sidePoint, centerPoint) {
        const wSidePoint = fill.context.rect.wrap(sidePoint)
        const wCenterPoint = fill.context.rect.wrap(centerPoint)
        const sideTerrain = fill.context.terrainLayer.get(sidePoint)
        const shorePoints = fill.context.shorePoints
        const isSideWater = Terrain.isWater(sideTerrain)
        // detect river mouth
        if (shorePoints.has(wCenterPoint) && isSideWater) {
            const directionId = this.getDirectionId(centerPoint, sidePoint)
            fill.context.flowMap.set(...wCenterPoint, directionId)
            return
        }
        if (fill.context.flowMap.has(...wSidePoint) || isSideWater) {
            return
        }

        // set flow only on current or lower terrain layer
        if (sideTerrain <= fill.context.terrain) {
            const directionId = this.getDirectionId(sidePoint, centerPoint)
            fill.context.nextPoints.delete(wSidePoint)
            fill.context.flowMap.set(...wSidePoint, directionId)
        } else {
            fill.context.nextPoints.add(wSidePoint)
        }
    }

    getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}


class ErosionConcurrentFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, ErosionFloodFill, context)
    }

    getChance(fill, origin) { return .2 }
    getGrowth(fill, origin) { return 3 }
}


export class ErosionLayer {
    #build(terrainLayer, props) {
        const context = {
            shorePoints: props.shorePoints,
            nextPoints: new PointSet(),
            basinMap: new PairMap(),
            flowMap: new PairMap(),
            rect: props.rect,
            terrainLayer,
        }
        let origins = props.shorePoints.points
        let mapFill = this.#erodeLayer(Terrain.BASIN, origins, context)
        // mapFill = this.#erodeLayer(Terrain.PLAIN, origins, context)
        return mapFill
    }

    #erodeLayer(terrain, origins, context) {
        context['terrain'] = terrain
        const fill = new ErosionConcurrentFill(origins, context)
        fill.fill()
        return fill
    }

    constructor(terrainLayer, props) {
        const mapFill = this.#build(terrainLayer, props)
        // if (Point.hash(wrappedPoint) == '15,25') {
        //     console.log('oipa');
        // }
        this.nextPoints = mapFill.context.nextPoints
        this.basinMap = mapFill.context.basinMap
        this.flowMap = mapFill.context.flowMap
        this.basinCount = props.shorePoints.size
        this.rect = props.rect
    }

    getBasin(point) {
        return this.basinMap.get(...this.rect.wrap(point))
    }

    getErosionDirection(point) {
        const id = this.flowMap.get(...this.rect.wrap(point))
        return Direction.fromId(id)
    }
}

