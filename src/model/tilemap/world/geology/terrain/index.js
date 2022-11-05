import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'

import { TerrainConcurrentFill } from './fill'
import { LAND_LAYERS, WATER_LAYERS, Terrain } from '../data'


const EMPTY = null


export class TerrainLayer {
    #landBorders = new PointSet()
    #waterBorders = new PointSet()
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #surfaceLayer
    #noiseLayer
    #matrix

    constructor(noiseLayer, surfaceLayer) {
        this.#surfaceLayer = surfaceLayer
        this.#noiseLayer = noiseLayer
        const baseLayer = this.#buildBaseLayer(noiseLayer.rect)
        this.#matrix = this.#buildLayer(baseLayer)
    }

    #buildBaseLayer(rect) {
        return Matrix.fromRect(rect, point => {
            this.#detectBorders(point)
            const isLand = this.#surfaceLayer.isLand(point)
            const steps = isLand ? LAND_LAYERS : WATER_LAYERS
            let terrain = isLand ? Terrain.BASIN : Terrain.SEA
            let prevStep = steps[0]
            for(let i = 0; i < steps.length; i++) {
                let step = steps[i]
                const noise = this.#noiseLayer.get(step.noise, point)
                // const isHigher = step.height > prevStep.height
                if (noise > step.ratio) {
                    terrain = step.terrain
                    prevStep = step
                }
            }
            return terrain
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
        })
    }

    #detectBorders(point) {
        for (let sidePoint of Point.adjacents(point)) {
            const sideSurface = this.#surfaceLayer.get(sidePoint)
            if (this.#surfaceLayer.isWater(point)) {
                if (! sideSurface.water) {
                    this.#waterBorders.add(point)
                    break
                }
            } else {
                if (sideSurface.water) {
                    this.#landBorders.add(point)
                    break
                }
            }
        }
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
