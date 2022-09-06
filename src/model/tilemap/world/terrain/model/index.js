import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { NoiseTileMap } from '/src/model/tilemap/noise'

import { NOISE_SPEC, PIPELINE, Terrain } from './terrain'


export class TerrainModel {
    #idMap

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
        let borderMap = Matrix.fromRect(rect, () => false)
        for(let spec of PIPELINE) {
            const layer = new Layer(idMap, noiseMaps)
            idMap = layer.build(borderMap, spec)
        }
        this.#idMap = idMap
    }

    get(point) {
        const id = this.#idMap.get(point)
        return Terrain.fromId(id)
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isWater(point) {
        return this.get(point).water
    }
}


class Layer {
    constructor(baseLayer, noiseMaps) {
        this.baseLayer = baseLayer
        this.noiseMaps = noiseMaps
    }

    build(borderMap, spec) {
        // convert noise to terrain id
        const layer = Matrix.fromRect(this.baseLayer.rect, point => {
            const currentId = this.baseLayer.get(point)
            for (let rule of spec) {
                if (currentId === rule.baseTerrain) {
                    const noiseMap = this.noiseMaps.get(rule.noise.id)
                    const noise = noiseMap.getNoise(point)
                    return this.buildPoint(point, noise, borderMap, rule)
                }
            }
            return currentId
        })
        // update borders
        layer.forEach((point, currentId) => {
            for (let sidePoint of Point.adjacents(point)) {
                if (currentId != layer.get(sidePoint)) {
                    borderMap.set(point, true)
                }
            }
        })
        return layer
    }

    buildPoint(point, noise, borderMap, rule) {
        const notBorder = borderMap.get(point) === false
        const isBaseTerrain = this.isBaseTerrain(point, rule.baseTerrain)
        const isAboveRatio = noise >= rule.ratio
        const isRated = rule.type == 'land' ? isAboveRatio : ! isAboveRatio
        const isValid = isBaseTerrain && notBorder && isRated
        return isValid ? rule.value : this.baseLayer.get(point)
    }

    isBaseTerrain(point, baseTerrain) {
        if (baseTerrain === null || baseTerrain === undefined) {
            return true
        }
        return this.baseLayer.get(point) === baseTerrain
    }
}
