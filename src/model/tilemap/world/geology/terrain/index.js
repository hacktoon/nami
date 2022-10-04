import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { NoiseMapSet } from './noise'
import { LandmassMap } from './landmass'
import { LAYERS, BASE_RATIO, BASE_NOISE, Terrain } from './schema'


export class TerrainModel {
    #shorePoints
    #terrainLayer
    #landmassMap

    #buildBaseLayer(props) {
        const outlineNoiseMap = props.noiseMapSet.get(BASE_NOISE)
        const typeMap = {land: Terrain.BASIN, water: Terrain.SEA}
        const getLayerType = point => {
            const noise = outlineNoiseMap.getNoise(point)
            return noise < BASE_RATIO ? 'water' : 'land'
        }
        return Matrix.fromRect(outlineNoiseMap.rect, point => {
            const layerType = getLayerType(point)
            const terrain = typeMap[layerType]
            props.pointQueue[layerType].push(point)
            // detect borders
            for (let sidePoint of Point.adjacents(point)) {
                const sideTerrain = typeMap[getLayerType(sidePoint)]
                if (terrain !== sideTerrain) {
                    props.borderPoints.add(point)
                    if (Terrain.isLand(terrain)) // is shore
                        props.shorePoints.add(point)
                    break
                }
            }
            return terrain
        })
    }

    #buildLandmassLayer(props) {
        let landmassId = 1
        for (let point of props.pointQueue.water) {
            const status = props.landmassMap.detect(
                this.#terrainLayer,
                landmassId,
                point
            )
            landmassId += status ? 1 : 0
        }
    }

    #buildSurfaceLayers(props) {
        for (let layer of LAYERS) {
            this.#buildLayer({...props, layer})
        }
    }

    #buildLayer(props) {
        const newPoints = []
        const layerType = Terrain.isLand(props.layer.terrain) ? 'land' : 'water'
        const noiseMap = props.noiseMapSet.get(props.layer.noise)
        props.pointQueue[layerType].forEach(point => {
            const noise = noiseMap.getNoise(point)
            if (props.borderPoints.has(point) || noise < props.layer.ratio)
                return
            this.#terrainLayer.set(point, props.layer.terrain)
            newPoints.push(point)
        })
        // detect borders on new points
        newPoints.forEach(point => {
            for (let sidePoint of Point.adjacents(point)) {
                const sideTerrain = this.#terrainLayer.get(sidePoint)
                if (sideTerrain !== props.layer.terrain) {
                    props.borderPoints.add(point)
                    return
                }
            }
        })
        props.pointQueue[layerType] = newPoints
    }

    constructor(rect, seed) {
        const pointQueue = {water: [], land: []}
        const landmassMap = new LandmassMap()
        const noiseMapSet = new NoiseMapSet(rect, seed)
        const shorePoints = new PointSet()
        const borderPoints = new PointSet()
        const props = {
            noiseMapSet, pointQueue, borderPoints, shorePoints,
            landmassMap
        }
        this.#shorePoints = shorePoints
        this.#landmassMap = landmassMap
        this.#terrainLayer = this.#buildBaseLayer(props)
        this.#buildLandmassLayer(props)
        this.#buildSurfaceLayers(props)
    }

    get(point) {
        const id = this.#terrainLayer.get(point)
        return Terrain.fromId(id)
    }

    isShore(point) {
        const wrappedPoint = this.#terrainLayer.rect.wrap(point)
        return this.#shorePoints.has(wrappedPoint)
    }

    isOcean(point) {
        const wrappedPoint = this.#terrainLayer.rect.wrap(point)
        return this.#landmassMap.isOcean(wrappedPoint)
    }
}
