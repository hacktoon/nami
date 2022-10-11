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

    #buildBaseLayer(oceanMap, props) {
        const noiseMap = props.noiseMapSet.get(BASE_NOISE)
        const typeMap = {land: Terrain.BASIN, water: Terrain.SEA}
        const baseLayer = Matrix.fromRect(noiseMap.rect, point => {
            const layerType = this.#getLayerType(noiseMap, point)
            const terrain = typeMap[layerType]
            let isWater = Terrain.isWater(terrain)
            // detect oceans by area
            if (isWater) {
                const isType = pt => {
                    return Terrain.isWater(typeMap[this.#getLayerType(noiseMap, pt)])
                }
                oceanMap.detect(point, isType)
                // reset lakes as basins
                if (! oceanMap.isOcean(point)) {
                    props.pointQueue.land.push(point)
                    return Terrain.BASIN
                }
            }
            props.pointQueue[layerType].push(point)
            return terrain
        })
        return baseLayer
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

    #detectShoreline(baseLayer, oceanMap, props) {
        // detect borders between terrains and shore points
        // after oceanMap is complete
        baseLayer.forEach((point, terrain) => {
            for (let sidePoint of Point.adjacents(point)) {
                const sideTerrain = baseLayer.get(sidePoint)
                if (terrain !== sideTerrain) {
                    props.borderPoints.add(point)
                    if (oceanMap.isOcean(sidePoint)) // is shore
                        props.shorePoints.add(point)
                    break
                }
            }
        })
    }

    constructor(props) {
        const oceanMap = new OceanMap(props.rect)
        const baseLayer = this.#buildBaseLayer(oceanMap, props)
        this.#detectShoreline(baseLayer, oceanMap, props)
        this.#terrainLayer = baseLayer
        // this.#buildSurfaceLayer(baseLayer, layers, props)
    }

    get(point) {
        return this.#terrainLayer.get(point)
    }
}
