import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { NoiseMapSet } from './noise'
import { LandmassMap } from './landmass'
import { LAYERS, BASE_RATIO, BASE_NOISE, Terrain } from './schema'

const MINIMUN_OCEAN_RATIO = 1  // 1%


export class TerrainModel {
    #shorePoints
    #terrainLayer
    #landmassMap

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

    #buildLandmassLayer(waterPoints) {
        let landmassId = 1
        const landmass = new LandmassMap(this.#terrainLayer)
        for (let point of waterPoints) {
            const status = landmass.detect(landmassId, point)
            landmassId += status ? 1 : 0
        }
        return landmass
    }

    constructor(rect, seed) {
        const pointQueue = {water: [], land: []}
        const noiseMapSet = new NoiseMapSet(rect, seed)
        const shorePoints = new PointSet()
        const borderPoints = new PointSet()
        const props = {noiseMapSet, pointQueue, borderPoints, shorePoints}
        this.#shorePoints = shorePoints
        this.#terrainLayer = this.#buildBaseLayer(props)
        this.#landmassMap = this.#buildLandmassLayer(pointQueue.water)
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
