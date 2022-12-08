import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'

import { LAND_LAYERS, WATER_LAYERS, Terrain } from '../data'


const EMPTY = null

const PHASES = [
    Terrain.BASIN,
    // Terrain.PLAIN,
    // Terrain.PLATEAU,
    // Terrain.MOUNTAIN,
    // Terrain.PEAK,
]

export class TerrainLayer {
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #noiseLayer
    #surfaceLayer
    #matrix

    constructor(noiseLayer, surfaceLayer) {
        this.#noiseLayer = noiseLayer
        this.#surfaceLayer = surfaceLayer
        this.#matrix = this.#buildLayer(noiseLayer.rect)
    }

    #buildLayer(rect) {
        const matrix = Matrix.fromRect(rect, () => EMPTY)
        const context = {
            surfaceLayer: this.#surfaceLayer,
            noiseLayer: this.#noiseLayer,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            matrix: matrix,
        }
        const landBorders = this.#surfaceLayer.landBorders
        const landContext = {...context, borders: landBorders}
        const waterContext = {
            ...context, borders: this.#surfaceLayer.waterBorders
        }
        new TerrainConcurrentFill(landBorders, landContext).fill()
        return matrix
    }

    get(point) {
        const id = this.#matrix.get(point)
        return Terrain.fromId(id)
    }
}



export class TerrainConcurrentFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, TerrainFloodFill, context, PHASES)
    }

    getChance(ref, origin) { return 0 }
    getGrowth(ref, origin) { return 1 }
}


class TerrainFloodFill extends ConcurrentFillUnit {
    setValue(ref, point, level) {
        const terrainId = ref.fill.phase
        const wrappedPoint = ref.context.matrix.wrap(point)
        ref.context.basinMap.set(...wrappedPoint, ref.id)
        ref.context.matrix.set(wrappedPoint, terrainId)
    }

    isEmpty(ref, relativeSidePoint) {
        return false
        const terrainId = ref.fill.phase
        const sidePoint = ref.context.matrix.wrap(relativeSidePoint)
        const isEmpty = ref.context.matrix.get(sidePoint) === EMPTY
        const terrain = Terrain.fromId(terrainId)
        const noise = ref.context.noiseLayer.get(sidePoint)
        const isTerrain = terrainId === noise
        const isBorder = ref.context.borders.has(sidePoint)
        return isLand && isBorder && isEmpty
    }

    isPhaseEmpty(ref, sidePoint) {
        return this.isEmpty(ref, sidePoint)
    }

    getNeighbors(ref, originPoint) {
        return Point.adjacents(originPoint)
    }

    // checkNeighbor(ref, sidePoint, centerPoint) {
    //     const wSidePoint = ref.context.matrix.wrap(sidePoint)
    //     const wCenterPoint = ref.context.matrix.wrap(centerPoint)
    //     const sideTerrainId = ref.context.matrix.get(sidePoint)
    //     const isSideWater = ref.context.surfaceLayer.isWater(wSidePoint)
    //     // detect river mouth
    //     if (ref.context.borders.has(wCenterPoint) && isSideWater) {
    //         const directionId = this.getDirectionId(centerPoint, sidePoint)
    //         ref.context.flowMap.set(...wCenterPoint, directionId)
    //         return
    //     }
    //     if (ref.context.flowMap.has(...wSidePoint) || isSideWater) {
    //         return
    //     }

    //     // set flow only on current or lower terrain layer
    //     if (sideTerrainId <= ref.fill.phase + 1) {
    //         const directionId = this.getDirectionId(sidePoint, centerPoint)
    //         ref.context.flowMap.set(...wSidePoint, directionId)
    //     }
    // }

    getDirectionId(sourcePoint, targetPoint) {
        const angle = Point.angle(sourcePoint, targetPoint)
        return Direction.fromAngle(angle).id
    }
}
