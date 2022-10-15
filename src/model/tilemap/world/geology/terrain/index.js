import { Matrix } from '/src/lib/matrix'
import { PairMap } from '/src/lib/map'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { LAYERS, BASE_RATIO, BASE_NOISE, Terrain } from '../data'


const MINIMUN_OCEAN_RATIO = 1  // 1%
const WATER = 0
const LAND = 1


class GeomassMap {
    // Geomasses are islands, continents, oceans, seas and lakes
    #idCount = 1

    constructor(rect) {
        this.rect = rect
        this.pointMassMap = new PairMap()
        this.areaMap = new Map()
        this.idMap = new Set()
    }

    detect(startPoint, getType) {
        let area = 0
        const canFill = point => {
            return getType(point) && ! this.pointMassMap.has(...point)
        }
        const onFill = point => {
            this.pointMassMap.set(...point, this.#idCount)
            area++
        }
        const wrapPoint = point => this.rect.wrap(point)
        if (! canFill(startPoint))
            return
        new ScanlineFill8(startPoint, {canFill, wrapPoint, onFill}).fill()
        this.areaMap.set(this.#idCount, area)
        const ratio = Math.round((area * 100) / this.rect.area)
        if (ratio >= MINIMUN_OCEAN_RATIO) {
            this.idMap.add(this.#idCount)
        }
        this.#idCount++
    }

    isOcean(point) {
        const wrappedPoint = this.rect.wrap(point)
        if (this.pointMassMap.has(...wrappedPoint)) {
            const id = this.pointMassMap.get(...wrappedPoint)
            return this.idMap.has(id)
        }
        return false
    }
}


export class TerrainLayer {
    #layer
    #geomassMap
    #shorePoints

    #buildLayer(noiseMap, geomassMap, ratio) {
        const getType = point => {
            const noise = noiseMap.getNoise(point)
            return noise < ratio ? WATER : LAND
        }
        return Matrix.fromRect(noiseMap.rect, point => {
            const type = getType(point)
            // geomassMap.detect(point, getType)
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

    constructor(props) {
        const noiseMap = props.noiseMapSet.get(BASE_NOISE)
        const geomassMap = new GeomassMap(props.rect)
        const layer = this.#buildLayer(
            noiseMap, geomassMap, BASE_RATIO
        )
        // this.#detectWaterBodies(layer, geomassMap, props)
        // this.#terrainLayer = layer
        // this.#buildSurfaceLayer(layer, layers, props)
        this.#geomassMap = geomassMap
        this.#layer = layer
    }

    isWater(point) {
        return this.#layer.get(point) == WATER
    }
}
