import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { NoiseTileMap } from '/src/model/tilemap/noise'

import { NOISE_SPEC, PIPELINE, Terrain } from './spec'


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
                seed: seed + id,
            })
            noiseMaps.set(id, map)
        }
        return noiseMaps
    }

    #build(baseLayer, spec) {
        // convert noise to terrain id
        const layer = Matrix.fromRect(baseLayer.rect, point => {
            const currentId = baseLayer.get(point)
            for (let rule of spec)
                if (currentId === rule.baseTerrain)
                    return this.#buildPoint(point, currentId, rule)
            return currentId
        })
        // set borders
        layer.forEach((point, currentId) => {
            for (let sidePoint of Point.adjacents(point)) {
                if (currentId !== layer.get(sidePoint)) {
                    this.#borderMap.set(point, true)
                    return
                }
            }
        })
        return layer
    }

    #buildPoint(point, currentId, spec) {
        const terrain = Terrain.fromId(spec.value)
        const notBorder = this.#borderMap.get(point) === false
        const noiseMap = this.noiseMaps.get(spec.noise.id)
        const noise = noiseMap.getNoise(point)
        const isAboveRatio = noise >= spec.ratio
        const isRated = terrain.water ? ! isAboveRatio : isAboveRatio
        const isBaseTerrain = currentId === spec.baseTerrain
        const isValid = isBaseTerrain && notBorder && isRated
        return isValid ? spec.value : currentId
    }

    constructor(rect, seed) {
        this.noiseMaps = this.#buildNoiseMaps(rect, seed)
        this.#borderMap = Matrix.fromRect(rect, () => false)
        let idMap = Matrix.fromRect(rect, () => Terrain.SEA)
        for(let spec of PIPELINE) {
            idMap = this.#build(idMap, spec)
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
        return ! this.get(point).water
    }

    isWater(point) {
        return this.get(point).water
    }
}
