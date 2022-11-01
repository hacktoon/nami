import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { Terrain, LAND_LAYERS, BASE_NOISE } from '../data'


const EMPTY = null


export class TerrainLayer {
    #geotypeLayer
    #landBorders
    #waterBorders
    #matrix

    constructor(rect, noiseMapSet, geotypeLayer) {
        this.#landBorders = new PointSet()
        this.#waterBorders = new PointSet()
        this.#geotypeLayer = geotypeLayer
        const noiseOutlineMap = noiseMapSet.get('outline')
        const noiseFeatureMap = noiseMapSet.get('feature')
        const noiseGrainMap = noiseMapSet.get('grained')
        this.#matrix = Matrix.fromRect(rect, point => {
            const isBorder = this.#detectBorder(point)
            const outlineNoise = noiseOutlineMap.getNoise(point)
            const featureNoise = noiseFeatureMap.getNoise(point)
            const grainNoise = noiseGrainMap.getNoise(point)
            if (geotypeLayer.isLand(point)) {
                let terrain = Terrain.BASIN
                if(isBorder) return terrain
                if (featureNoise > .35 && outlineNoise > .6) {
                    terrain = Terrain.PLAIN
                    if (grainNoise > .6) {
                        terrain = Terrain.PLATEAU
                        // if (featureNoise > .45) {
                        //     terrain = Terrain.MOUNTAIN
                        //     if (grainNoise > .6) {
                        //         terrain = Terrain.PEAK
                        //     }
                        // }
                    }
                }
                return terrain
            }
            return Terrain.OCEAN
        })
    }

    #detectBorder(point) {
        for (let sidePoint of Point.adjacents(point)) {
            const sideGeotype = this.#geotypeLayer.get(sidePoint)
            if (this.#geotypeLayer.isWater(point)) {
                if (! sideGeotype.water) {
                    this.#waterBorders.add(point)
                    return true
                }
            } else {
                if (sideGeotype.water) {
                    this.#landBorders.add(point)
                    return true
                }
            }
        }
        return false
    }

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
