import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


export class OutlineNoiseStep {
    constructor(spec, baseLayer, noiseMaps) {
        this.spec = spec
        this.baseLayer = baseLayer
        this.noiseMaps = noiseMaps
    }

    buildLayer(borderMap) {
        // convert noise to terrain id
        const layer = Matrix.fromRect(this.baseLayer.rect, point => {
            const noiseMap = this.noiseMaps.get(this.spec.noise.id)
            const noise = noiseMap.getNoise(point)
            return this.buildPoint(point, noise, borderMap, this.spec)
        })
        // mark borders
        layer.forEach((point, currentId) => {
            const border = this.detectBorder(point, currentId, layer)
            borderMap.set(point, border)
        })
        return layer
    }

    buildPoint(point, noise, borderMap, rule) {
        const notBorder = borderMap.get(point) === false
        const isOpenTerrain = this.isOpenTerrain(point, rule.base)
        const isValid = isOpenTerrain && notBorder && noise >= rule.ratio
        return isValid ? rule.value : this.baseLayer.get(point)
    }

    detectBorder(point, currentId, layer) {
        for (let sidePoint of Point.adjacents(point)) {
            if (currentId != layer.get(sidePoint)) {
                return true
            }
        }
        return false
    }

    isOpenTerrain(point, base) {
        if (base === null || base === undefined) {
            return true
        }
        return this.baseLayer.get(point) === base
    }
}
