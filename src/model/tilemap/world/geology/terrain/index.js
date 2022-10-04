import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { NoiseMapSet } from './noise'
import { LandmassLayer } from './landmass'
import { LAYERS, BASE_RATIO, BASE_NOISE, Terrain } from './schema'


export class TerrainModel {
    #shorePoints
    #baseLayer
    #landmassLayer

    #buildBaseLayer(props) {
        let landmassId = 1
        const noiseMap = props.noiseMapSet.get(BASE_NOISE)
        const typeMap = {land: Terrain.BASIN, water: Terrain.SEA}
        const getLayerType = point => {
            const noise = noiseMap.getNoise(point)
            return noise < BASE_RATIO ? 'water' : 'land'
        }
        return Matrix.fromRect(noiseMap.rect, point => {
            const layerType = getLayerType(point)
            const terrain = typeMap[layerType]
            let isWater = Terrain.isWater(terrain)
            // detect oceans by area
            if (isWater) {
                const detected = this.#landmassLayer.detectOcean(
                    point => typeMap[getLayerType(point)],
                    landmassId,
                    point
                )
                landmassId += detected ? 1 : 0
            }
            // detect borders between terrains and shore points
            for (let sidePoint of Point.adjacents(point)) {
                const sideTerrain = typeMap[getLayerType(sidePoint)]
                if (terrain !== sideTerrain) {
                    props.borderPoints.add(point)
                    if (this.#landmassLayer.isOcean(sidePoint)) // is shore
                        this.#shorePoints.add(point)
                    break
                }
            }
            // reset lakes as depressions
            if (isWater && ! this.#landmassLayer.isOcean(point)) {
                props.pointQueue.land.push(point)
                return Terrain.BASIN
            } else {
                props.pointQueue[layerType].push(point)
            }
            return terrain
        })
    }

    #buildSurfaceLayers(props, layers) {
        for (let layer of layers) {
            this.#buildSurfaceLayer({...props, layer})
        }
    }

    #buildSurfaceLayer(props) {
        const newPoints = []
        const layerType = Terrain.isLand(props.layer.terrain) ? 'land' : 'water'
        const noiseMap = props.noiseMapSet.get(props.layer.noise)
        props.pointQueue[layerType].forEach(point => {
            const noise = noiseMap.getNoise(point)
            if (props.borderPoints.has(point) || noise < props.layer.ratio)
                return
            this.#baseLayer.set(point, props.layer.terrain)
            newPoints.push(point)
        })
        // detect borders on new points
        newPoints.forEach(point => {
            for (let sidePoint of Point.adjacents(point)) {
                const sideTerrain = this.#baseLayer.get(sidePoint)
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
        const noiseMapSet = new NoiseMapSet(rect, seed)
        const borderPoints = new PointSet()
        const props = {noiseMapSet, pointQueue, borderPoints}
        this.#landmassLayer = new LandmassLayer(rect)
        this.#shorePoints = new PointSet()
        this.#baseLayer = this.#buildBaseLayer(props)
        // this.#buildTerrainLayer(props)
        this.#buildSurfaceLayers(props, LAYERS)
    }

    get(point) {
        const id = this.#baseLayer.get(point)
        return Terrain.fromId(id)
    }

    isShore(point) {
        const wrappedPoint = this.#baseLayer.rect.wrap(point)
        return this.#shorePoints.has(wrappedPoint)
    }

    isOcean(point) {
        return this.#landmassLayer.isOcean(point)
    }
}
