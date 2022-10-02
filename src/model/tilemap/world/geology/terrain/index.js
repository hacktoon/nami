import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { NoiseMapSet } from './noise'
import { LAYERS, BASE_RATIO, BASE_NOISE, Terrain } from './schema'


export class TerrainModel {
    #erosionPoints
    #borderPoints
    #terrainMap

    #buildLayer(props) {
        const newPoints = []
        const layerType = Terrain.isLand(props.layer.terrain) ? 'land' : 'water'
        const noiseMap = props.noiseMapSet.get(props.layer.noise)
        props.pointQueue[layerType].forEach(point => {
            const noise = noiseMap.getNoise(point)
            if (this.#borderPoints.has(point) || noise < props.layer.ratio)
                return
            this.#terrainMap.set(point, props.layer.terrain)
            newPoints.push(point)
        })
        // detect borders on new points
        newPoints.forEach(point => {
            for (let sidePoint of Point.adjacents(point)) {
                const sideTerrain = this.#terrainMap.get(sidePoint)
                if (sideTerrain !== props.layer.terrain) {
                    this.#setBorder(point, props.layer.terrain, props)
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
        const layer = Matrix.fromRect(outlineNoiseMap.rect, point => {
            const layerType = getLayerType(point)
            const terrain = typeMap[layerType]
            props.pointQueue[layerType].push(point)
            // detect borders
            for (let sidePoint of Point.adjacents(point)) {
                const sideTerrain = typeMap[getLayerType(sidePoint)]
                if (terrain !== sideTerrain) {
                    // side is different, this point is a border
                    this.#setBorder(point, terrain, props)
                    break
                }
            }
            return terrain
        })
        return layer
    }

    #detectAreas() {

    }

    #setBorder(point, terrain, props) {
        this.#borderPoints.add(point)
        if (Terrain.isLand(terrain))
            props.erosionPoints.get(terrain).push(point)
    }

    constructor(rect, seed) {
        const noiseMapSet = new NoiseMapSet(rect, seed)
        const pointQueue = {water: [], land: []}
        const erosionPoints = new Map(
            Terrain.landTypes().map(terrain => [terrain.id, []])
        )
        const props = {pointQueue,  noiseMapSet, erosionPoints}
        this.#borderPoints = new PointSet()
        this.#terrainMap = this.#buildBaseLayer(props)
        for (let layer of LAYERS) {
            this.#buildLayer({...props, layer})
        }
        this.#erosionPoints = erosionPoints
    }

    get(point) {
        const id = this.#terrainMap.get(point)
        return Terrain.fromId(id)
    }

    isBorder(point) {
        return this.#borderPoints.has(point)
    }

    getErosionPoints() {
        return this.#erosionPoints
    }
}
