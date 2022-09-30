import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { NOISE_SPEC, NoiseMapSet } from './noise'
import { LAYERS, BASE_RATIO, Terrain } from './spec'


export class TerrainModel {
    #borderMap
    #terrainMap
    #pointSetByType

    #buildLayer(layer) {
        const terrain = Terrain.fromId(layer.terrain)
        const layerType = terrain.water ? 'water' : 'land'
        const newPointSet = new PointSet()
        const noiseMap = this.noiseMaps.get(layer.noise.id)
        this.#pointSetByType[layerType].forEach(point => {
            const noise = noiseMap.getNoise(point)
            if (this.#borderMap.has(point) || noise < layer.ratio)
                return
            this.#terrainMap.set(point, layer.terrain)
            newPointSet.add(point)
        })
        // detect borders on new points
        newPointSet.forEach(point => {
            for (let sidePoint of Point.adjacents(point)) {
                if (this.#terrainMap.get(sidePoint) !== layer.terrain) {
                    // side is different, this point is a border
                    this.#borderMap.set(point, layer.terrain)
                    return
                }
            }
        })
        this.#pointSetByType[layerType] = newPointSet
    }

    #buildBaseLayer() {
        const outlineNoiseMap = this.noiseMaps.get(NOISE_SPEC.outline.id)
        const typeMap = {land: Terrain.BASIN, water: Terrain.SEA}
        const getType = noise => noise < BASE_RATIO ? 'water' : 'land'
        return Matrix.fromRect(outlineNoiseMap.rect, point => {
            const noise = outlineNoiseMap.getNoise(point)
            const type = getType(noise)
            const terrain = typeMap[type]
            this.#pointSetByType[type].add(point)
            // detect borders
            for (let sidePoint of Point.adjacents(point)) {
                const sideNoise = outlineNoiseMap.getNoise(sidePoint)
                const sideTerrain = typeMap[getType(sideNoise)]
                if (terrain !== sideTerrain) {
                    // side is different, this point is a border
                    this.#borderMap.set(point, terrain)
                    break
                }
            }
            return terrain
        })
    }

    constructor(rect, seed) {
        this.#pointSetByType = {
            water: new PointSet(),
            land: new PointSet(),
        }
        this.noiseMaps = new NoiseMapSet(rect, seed)
        this.#borderMap = new BorderMap(rect)
        this.#terrainMap = this.#buildBaseLayer()
        for (let layer of LAYERS) {
            this.#buildLayer(layer)
        }
    }

    get(point) {
        const id = this.#terrainMap.get(point)
        return Terrain.fromId(id)
    }

    isBorder(point) {
        return this.#borderMap.get(point)
    }

    getBorders(id) {
        return this.#borderMap.getBorders(id)
    }

    isLand(point) {
        return ! this.isWater(point)
    }

    isWater(point) {
        return this.get(point).water
    }
}


class BorderMap {
    #matrix
    #borders

    constructor(rect) {
        this.#matrix = Matrix.fromRect(rect, () => false)
        this.#borders = new Map(
            Terrain.types().map(terrain => [terrain.id, []])
        )
    }

    has(point) {
        return this.#matrix.get(point) === true
    }

    get(point) {
        return this.#matrix.get(point)
    }

    set(point, terrainId) {
        if (Terrain.isLand(terrainId))
            this.#borders.get(terrainId).push(point)
        return this.#matrix.set(point, true)
    }

    getBorders(id) {
        return this.#borders.get(id)
    }
}
