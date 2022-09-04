import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { TerrainTypeMap } from './terrain'


class Layer {
    constructor(...rules) {
        this.rules = rules
    }
}


export class OutlineNoiseLayer extends Layer {
    build(noiseMaps, typeMap, terrainMap) {
        return Matrix.fromRect(terrainMap.rect, point => {
            const currentId = terrainMap.get(point)
            for (let rule of this.rules) {
                const noiseMap = noiseMaps.get(rule.noise.id)
                const params = {noiseMap, typeMap, terrainMap, ...rule}
                if (this.isBlocked(point, params)) {
                    return currentId  // return what was given
                }
                return this.buildPoint(point, currentId, params)
            }
            return currentId
        })
    }

    isBlocked(point, params) {
        const id = params.terrainMap.get(point)
        if (params.base === undefined)
            return false
        if (! params.typeMap.isMargin(id))
            return true
        if (params.base === params.typeMap.get(id).id)
            return true
        return true
    }

    buildPoint(point, currentId, params) {
        const noise = params.noiseMap.getNoise(point)
        let id = currentId
        if (noise >= params.ratio) {
            id = params.value
        }
        for (let sidePoint of Point.adjacents(point)) {
            const sideNoise = params.noiseMap.getNoise(sidePoint)
            const isSideBlocked = this.isBlocked(sidePoint, params)
            if (isSideBlocked || this.isMargin(noise, sideNoise, params))
                return id  // margin: is positive
        }
        return -id  // non-margin: is negative
    }

    isMargin(noise, sideNoise, params) {
        const isAbove = noise >= params.ratio && sideNoise < params.ratio
        const isBelow = noise < params.ratio && sideNoise >= params.ratio
        return isAbove || isBelow
    }
}
