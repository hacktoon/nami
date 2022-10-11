import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'

import { OceanMap } from './ocean'
import { LAYERS, BASE_RATIO, BASE_NOISE, Terrain } from '../data'


export class TerrainLayer {
    #terrainLayer

    #getLayerType(noiseMap, point) {
        const noise = noiseMap.getNoise(point)
        return noise < BASE_RATIO ? 'water' : 'land'
    }

    #buildBaseLayer(props) {
        const noiseMap = props.noiseMapSet.get(BASE_NOISE)
        const typeMap = {land: Terrain.BASIN, water: Terrain.SEA}
        const baseLayer = Matrix.fromRect(noiseMap.rect, point => {
            const layerType = this.#getLayerType(noiseMap, point)
            const terrain = typeMap[layerType]

            props.pointQueue[layerType].push(point)

            if (Terrain.isWater(terrain)) return terrain

            // detect shore points
            for (let sidePoint of Point.adjacents(point)) {
                const sideLayerType = this.#getLayerType(noiseMap, sidePoint)
                const sideTerrain = typeMap[sideLayerType]
                if (terrain !== sideTerrain) {
                    props.borderPoints.add(point)
                    if (Terrain.isWater(sideTerrain)) // is shore
                        props.shorePoints.add(point)
                    break
                }
            }

            return terrain
        })
        return baseLayer
    }

    #detectWaterBodies(baseLayer, oceanMap, props) {
        baseLayer.forEach((point, terrain) => {
            // detect oceans by area
            if (Terrain.isWater(terrain)) {
                const isType = pt => Terrain.isWater(baseLayer.get(pt))
                oceanMap.detect(point, isType)
                // reset lakes as basins
                if (! oceanMap.isOcean(point)) {
                    props.pointQueue.land.push(point)
                    return Terrain.BASIN
                }
            }
        })
    }

    #buildSurfaceLayer(baseLayer, layers, props) {
        for (let layer of layers) {
            const newPoints = []
            const layerType = Terrain.isLand(layer.terrain) ? 'land' : 'water'
            const noiseMap = props.noiseMapSet.get(layer.noise)
            props.pointQueue[layerType].forEach(point => {
                const noise = noiseMap.getNoise(point)
                if (props.borderPoints.has(point) || noise < layer.ratio)
                    return
                baseLayer.set(point, layer.terrain)
                newPoints.push(point)
            })
            // detect borders on new points
            newPoints.forEach(point => {
                for (let sidePoint of Point.adjacents(point)) {
                    const sideTerrain = baseLayer.get(sidePoint)
                    if (sideTerrain !== layer.terrain) {
                        props.borderPoints.add(point)
                        return
                    }
                }
            })
            props.pointQueue[layerType] = newPoints
        }
        return baseLayer
    }

    constructor(props) {
        const oceanMap = new OceanMap(props.rect)
        const baseLayer = this.#buildBaseLayer(props)
        this.#detectWaterBodies(baseLayer, oceanMap, props)
        this.#terrainLayer = baseLayer
        // this.#buildSurfaceLayer(baseLayer, layers, props)
    }

    get(point) {
        return this.#terrainLayer.get(point)
    }
}
