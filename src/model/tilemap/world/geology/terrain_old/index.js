import { Matrix } from '/src/lib/matrix'

import { LAYERS, BASE_RATIO, BASE_NOISE } from '../data'
import { GeomassMap } from './geomass'
import { LAND, WATER } from '../data'



export class TerrainLayer {
    #layer
    #shorePoints

    constructor(props) {
        const noiseMap = props.noiseMapSet.get(BASE_NOISE)
        const geomassMap = new GeomassMap(props.rect)
        const layer = this.#buildLayer(noiseMap, geomassMap, BASE_RATIO)
        this.geomassMap = geomassMap
        this.#layer = layer
    }

    #buildLayer(noiseMap, geomassMap, ratio) {
        const getType = point => {
            const noise = noiseMap.getNoise(point)
            return noise < ratio ? WATER : LAND
        }
        return Matrix.fromRect(noiseMap.rect, point => {
            const type = getType(point)
            geomassMap.detect(point, type, getType)
            return type
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

    isWater(point) {
        return this.#layer.get(point) === WATER
    }
}
