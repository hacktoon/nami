import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PairMap } from '/src/lib/map'

import { Terrain } from '../data'


const EMPTY = null

const PHASES = [
    Terrain.BASIN,
    Terrain.PLAIN,
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
            matrix: matrix
        }
        const origins = this.#surfaceLayer.landBorders.points
        new TerrainConcurrentFill(origins, context).fill()
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
        const sidePoint = ref.context.matrix.wrap(relativeSidePoint)
        const terrain = Terrain.fromId(ref.fill.phase)
        const noise = ref.context.noiseLayer.get(terrain.noise, sidePoint)
        const isEmpty = ref.context.matrix.get(sidePoint) === EMPTY
        const notBorder = ! ref.context.surfaceLayer.isBorder(sidePoint)
        return terrain.ratio > noise && isEmpty && notBorder
    }

    isPhaseEmpty(ref, sidePoint) {
        const terrainId = ref.fill.phase
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
