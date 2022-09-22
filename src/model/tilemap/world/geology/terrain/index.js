import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { NoiseTileMap } from '/src/model/tilemap/noise'

import { NOISE_SPEC } from './noise'
import { PIPELINE, Terrain } from './spec'


export class TerrainModel {
    #idMap
    #borderMap

    #buildNoiseMaps(rect, seed) {
        const noiseMaps = new Map()
        for(let [id, spec] of Object.entries(NOISE_SPEC)) {
            const map = NoiseTileMap.fromData({
                rect: rect.hash(),
                octaves: spec.octaves,
                resolution: spec.resolution,
                scale: spec.scale,
                seed: `${seed}${id}`,
            })
            noiseMaps.set(id, map)
        }
        return noiseMaps
    }

    #buildLayer(baseLayer, spec) {
        // convert noise map to terrain id map
        const layer = Matrix.fromRect(baseLayer.rect, point => {
            const currentId = baseLayer.get(point)
            for (let rule of spec)
                if (currentId === rule.baseTerrain)
                    return this.#buildPoint(point, currentId, rule)
            return currentId
        })
        // set borders for each different terrain type
        layer.forEach((point, currentId) => {
            if (this.#borderMap.has(point))
                return
            for (let sidePoint of Point.adjacents(point)) {
                if (currentId !== layer.get(sidePoint)) {
                    this.#borderMap.set(point, currentId)
                    return
                }
            }
        })
        return layer
    }

    #buildPoint(point, currentId, spec) {
        const terrain = Terrain.fromId(spec.terrain)
        const notBorder = this.#borderMap.get(point) === false
        const noiseMap = this.noiseMaps.get(spec.noise.id)
        const noise = noiseMap.getNoise(point)
        const isValidRatio = noise >= spec.ratio
        const isBaseTerrain = currentId === spec.baseTerrain
        const isRated = terrain.water ? ! isValidRatio : isValidRatio
        const isValid = isBaseTerrain && notBorder && isRated
        return isValid ? spec.terrain : currentId
    }

    constructor(rect, seed) {
        this.noiseMaps = this.#buildNoiseMaps(rect, seed)
        this.#borderMap = new BorderMap(rect)
        let idMap = Matrix.fromRect(rect, () => Terrain.SEA)
        for(let spec of PIPELINE) {
            idMap = this.#buildLayer(idMap, spec)
        }
        this.#idMap = idMap
    }

    get(point) {
        const id = this.#idMap.get(point)
        return Terrain.fromId(id)
    }

    isBorder(point) {
        return this.#borderMap.get(point)
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
        this.#borders.get(terrainId).push(point)
        return this.#matrix.set(point, true)
    }

    getBorders(id) {
        return this.#borders.get(id)
    }
}
