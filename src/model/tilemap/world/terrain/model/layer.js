import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


class Layer {
    constructor(params) {
        this.params = params
    }
}


class NoiseLayer extends Layer {
    build(noiseMaps, baseMap=null) {
        const noiseMap = noiseMaps.get(this.params.noise.id)
        const params = {noiseMap, baseMap, ...this.params}
        return Matrix.fromRect(noiseMap.rect, point => {
            for (let sidePoint of Point.adjacents(point)) {
                const noise = params.noiseMap.getNoise(point)
                const tile = this.buildTileBySide(noise, sidePoint, params)
                if (tile !== null) return tile
            }
            const noise = noiseMap.getNoise(point)
            return this.buildTile(noise, params)
        })
    }
}


export class OutlineNoiseLayer extends NoiseLayer {
    buildTile(noise, params) {
        return noise >= params.ratio ? -params.aboveRatio : -params.belowRatio
    }

    buildTileBySide(noise, sidePoint, params) {
        const sideNoise = params.noiseMap.getNoise(sidePoint)
        if (noise >= params.ratio && sideNoise < params.ratio) {
            return params.aboveRatio
        }
        if (noise < params.ratio && sideNoise >= params.ratio) {
            return params.belowRatio
        }
        return null
    }
}


export class PlainsNoiseLayer extends NoiseLayer {
    buildTile(noise, params) {
        return noise >= params.ratio ? -params.aboveRatio : -params.belowRatio
    }

    buildTileBySide(point, sidePoint, params) {
        const noise = params.noiseMap.getNoise(point)
        const sideNoise = params.noiseMap.getNoise(sidePoint)

        return null
    }
}
