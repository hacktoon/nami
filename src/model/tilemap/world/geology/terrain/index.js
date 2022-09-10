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

    constructor(rect, seed) {
        const noiseMaps = this.#buildNoiseMaps(rect, seed)
        let idMap = Matrix.fromRect(rect, () => Terrain.SEA)
        const borderMap = Matrix.fromRect(rect, () => false)
        const layer = new Layer(borderMap, noiseMaps)
        for(let spec of PIPELINE) {
            idMap = layer.build(idMap, spec)
        }
        this.#idMap = idMap
        this.#borderMap = borderMap
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


class Layer {
    constructor(borderMap, noiseMaps) {
        this.borderMap = borderMap
        this.noiseMaps = noiseMaps
    }

    build(baseLayer, spec) {
        // convert noise to terrain id
        const layer = Matrix.fromRect(baseLayer.rect, point => {
            const currentId = baseLayer.get(point)
            for (let rule of spec) {
                if (currentId !== rule.baseTerrain)
                    continue
                const noiseMap = this.noiseMaps.get(rule.noise.id)
                const noise = noiseMap.getNoise(point)
                return this.buildPoint(baseLayer, point, noise, rule)
            }
            return currentId
        })
        // set borders
        layer.forEach((point, currentId) => {
            for (let sidePoint of Point.adjacents(point)) {
                if (currentId != layer.get(sidePoint)) {
                    this.borderMap.set(point, true)
                    return
                }
            }
        })
        return layer
    }

    buildPoint(baseLayer, point, noise, rule) {
        const terrain = Terrain.fromId(rule.value)
        const notBorder = this.borderMap.get(point) === false
        const isBaseTerrain = baseLayer.get(point) === rule.baseTerrain
        const isAboveRatio = noise >= rule.ratio
        const isRated = terrain.water ? ! isAboveRatio : isAboveRatio
        const isValid = isBaseTerrain && notBorder && isRated
        return isValid ? rule.value : baseLayer.get(point)
    }
}
