import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { Terrain } from '../data'


const EMPTY = null


export class TerrainLayer {
    #landBorders = new PointSet()
    #waterBorders = new PointSet()
    #geotypeLayer
    #noiseMapSet
    #matrix

    constructor(rect, noiseMapSet, geotypeLayer) {
        this.#geotypeLayer = geotypeLayer
        this.#noiseMapSet = noiseMapSet
        this.#matrix = this.#buildLayer(rect)
    }

    #buildLayer(rect) {
        const matrix = Matrix.fromRect(rect, point => {
            this.#detectBorder(point)
            return EMPTY
        })
        return this.#buildTerrainByErosion(matrix)
    }

    #buildTerrainByErosion(matrix) {

        return matrix
    }

    #detectBorder(point) {
        for (let sidePoint of Point.adjacents(point)) {
            const sideGeotype = this.#geotypeLayer.get(sidePoint)
            if (this.#geotypeLayer.isWater(point)) {
                if (! sideGeotype.water) {
                    this.#waterBorders.add(point)
                    return
                }
            } else {
                if (sideGeotype.water) {
                    this.#landBorders.add(point)
                    return
                }
            }
        }
    }

    // const noiseOutlineMap = noiseMapSet.get('outline')
    // const noiseFeatureMap = noiseMapSet.get('feature')
    // const noiseGrainMap = noiseMapSet.get('grained')
    // const outlineNoise = noiseOutlineMap.getNoise(point)
    // const featureNoise = noiseFeatureMap.getNoise(point)
    // const grainNoise = noiseGrainMap.getNoise(point)
    // if (this.#geotypeLayer.isLand(point)) {
    //     let terrain = Terrain.BASIN
    //     if (featureNoise > .35 && outlineNoise > .6) {
    //         terrain = Terrain.PLAIN
    //         if (grainNoise > .6) {
    //             terrain = Terrain.PLATEAU
    //             // if (featureNoise > .45) {
    //             //     terrain = Terrain.MOUNTAIN
    //             //     if (grainNoise > .6) {
    //             //         terrain = Terrain.PEAK
    //             //     }
    //             // }
    //         }
    //     }
    //     return terrain
    // }
    get(point) {
        const id = this.#matrix.get(point)
        return Terrain.fromId(id)
    }

    isLandBorder(point) {
        return this.#landBorders.has(point)
    }

    isWaterBorder(point) {
        return this.#waterBorders.has(point)
    }
}
