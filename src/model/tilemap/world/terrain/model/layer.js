import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { TerrainTypeMap } from './terrain'


class Layer {
    constructor(params) {
        this.params = params
    }
}


export class OutlineNoiseLayer extends Layer {
    build(noiseMaps, typeMap, terrainMap) {
        const noiseMap = noiseMaps.get(this.params.noise.id)
        const params = {noiseMap, typeMap, terrainMap, ...this.params}
        return Matrix.fromRect(noiseMap.rect, point => {
            if (this.isBlocked(point, params)) {
                return params.terrainMap.get(point)
            }
            return this.buildPoint(point, params)
        })
    }

    isBlocked(point, params) {
        const id = params.terrainMap.get(point)
        if (id === null || id === undefined)
            return false
        if (params.typeMap.isMargin(id))
            return true
        if (params.base === undefined)
            return true
        if (params.base === params.typeMap.get(id).id)
            return true
        return false
    }

    buildPoint(point, params) {
        const noise = params.noiseMap.getNoise(point)
        const id = this.buildTerrain(noise, params)
        for (let sidePoint of Point.adjacents(point)) {
            const sideNoise = params.noiseMap.getNoise(sidePoint)
            const isSideBlocked = this.isBlocked(sidePoint, params)
            if (isSideBlocked || this.isMargin(noise, sideNoise, params))
                return id  // margin: is positive
        }
        return -id  // non-margin: is negative
    }

    buildTerrain(noise, params) {
        const [above, below] = params.range
        return noise >= params.ratio ? above : below
    }

    isMargin(noise, sideNoise, params) {
        const isAbove = noise >= params.ratio && sideNoise < params.ratio
        const isBelow = noise < params.ratio && sideNoise >= params.ratio
        return isAbove || isBelow
    }
}


export class TypeOutlineNoiseLayer extends OutlineNoiseLayer {

}

