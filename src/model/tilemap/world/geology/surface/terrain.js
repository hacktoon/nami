import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'

import { LAYERS, BASE_RATIO, BASE_NOISE, Terrain } from './schema'


export class TerrainLayer {
    #terrainLayer

    #buildTerrainLayer(layers, props) {
        const noiseMap = props.noiseMapSet.get(BASE_NOISE)
        const typeMap = {land: Terrain.BASIN, water: Terrain.SEA}
        const getLayerType = point => {
            const noise = noiseMap.getNoise(point)
            return noise < BASE_RATIO ? 'water' : 'land'
        }
        const baseLayer = Matrix.fromRect(noiseMap.rect, point => {
            const layerType = getLayerType(point)
            const terrain = typeMap[layerType]
            let isWater = Terrain.isWater(terrain)
            // detect oceans by area
            if (isWater) {
                const isType = pt => Terrain.isWater(typeMap[getLayerType(pt)])
                props.oceanMap.detect(point, isType)
            }
            // detect borders between terrains and shore points
            for (let sidePoint of Point.adjacents(point)) {
                const sideTerrain = typeMap[getLayerType(sidePoint)]
                if (terrain !== sideTerrain) {
                    props.borderPoints.add(point)
                    if (props.oceanMap.isOcean(sidePoint)) // is shore
                        props.shorePoints.add(point)
                    break
                }
            }
            // reset lakes as basins
            if (isWater && ! props.oceanMap.isOcean(point)) {
                props.pointQueue.land.push(point)
                return Terrain.BASIN
            }
            props.pointQueue[layerType].push(point)
            return terrain
        })
        return this.#buildSurfaceLayer(baseLayer, layers, props)
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
        this.#terrainLayer = this.#buildTerrainLayer(LAYERS, props)
    }

    get(point) {
        return this.#terrainLayer.get(point)
    }
}
