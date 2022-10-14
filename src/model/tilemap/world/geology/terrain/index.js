import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'

import { WaterMap } from './water'
import { LAYERS, BASE_RATIO, BASE_NOISE, Terrain } from '../data'


const WATER = 0
const LAND = 1


export class TerrainLayer {
    #terrainLayer
    #baseLayer

    #buildBaseLayer(noiseId, ratio, props) {
        const noiseMap = props.noiseMapSet.get(noiseId)
        return Matrix.fromRect(noiseMap.rect, point => {
            const noise = noiseMap.getNoise(point)
            return noise < ratio ? WATER : LAND
        })
    }

    #detectWaterBodies(baseLayer, waterMap, props) {
        baseLayer.forEach((point, terrain) => {
            // detect oceans by area
            if (Terrain.isWater(terrain)) {
                const isType = pt => Terrain.isWater(baseLayer.get(pt))
                waterMap.detect(point, isType)
                // reset lakes as basins
                if (! waterMap.isOcean(point)) {
                    return Terrain.BASIN
                }
            }
        })
    }

    #detectShorePoints() {
        // props.pointQueue[layerType].push(point)

        //  if (Terrain.isWater(terrain)) return terrain

        //  // detect shore points
        //  for (let sidePoint of Point.adjacents(point)) {
        //      const sideLayerType = this.#getLayerType(noiseMap, sidePoint)
        //      const sideTerrain = typeMap[sideLayerType]
        //      if (terrain !== sideTerrain) {
        //          props.borderPoints.add(point)
        //          if (Terrain.isWater(sideTerrain)) // is shore
        //              props.shorePoints.add(point)
        //          break
        //      }
        //  }
    }

    constructor(props) {
        const baseLayer = this.#buildBaseLayer(BASE_NOISE, BASE_RATIO, props)
        // this.#detectWaterBodies(baseLayer, waterMap, props)
        this.#baseLayer = baseLayer
        // this.#terrainLayer = baseLayer
        // this.#buildSurfaceLayer(baseLayer, layers, props)
    }

    isWater(point) {
        return this.#baseLayer.get(point) == WATER
    }
}
