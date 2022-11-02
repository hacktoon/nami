import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'

import { TerrainConcurrentFill } from './fill'
import { Terrain } from '../data'


const EMPTY = null


export class TerrainLayer {
    #landBorders = new PointSet()
    #waterBorders = new PointSet()
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #geotypeLayer
    #noiseMapSet
    #matrix

    constructor(rect, noiseMapSet, geotypeLayer) {
        this.#geotypeLayer = geotypeLayer
        this.#noiseMapSet = noiseMapSet
        const baseLayer = this.#buildBaseLayer(rect)
        this.#matrix = this.#buildLayer(baseLayer)
    }

    #buildBaseLayer(rect) {
        return Matrix.fromRect(rect, point => {
            for (let sidePoint of Point.adjacents(point)) {
                const sideGeotype = this.#geotypeLayer.get(sidePoint)
                if (this.#geotypeLayer.isWater(point)) {
                    if (! sideGeotype.water) {
                        this.#waterBorders.add(point)
                        return Terrain.SEA
                    }
                } else {
                    if (sideGeotype.water) {
                        this.#landBorders.add(point)
                        return Terrain.SEA
                    }
                }
            }
            return Terrain.BASIN
        })
    }

    #buildLayer(baseLayer) {
        const context = {
            landBorders: this.#landBorders,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            matrix: baseLayer,
        }
        // new TerrainConcurrentFill(this.#landBorders.points, context).fill()
        return baseLayer
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
