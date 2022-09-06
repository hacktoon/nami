import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


export class OutlineNoiseStep {
    constructor(baseLayer, noiseMaps) {
        this.baseLayer = baseLayer
        this.noiseMaps = noiseMaps
    }

    buildLayer(borderMap, spec) {
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
        // mark borders
        layer.forEach((point, currentId) => {
            const border = this.detectBorder(point, currentId, layer)
            borderMap.set(point, border)
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

    detectBorder(point, currentId, layer) {
        for (let sidePoint of Point.adjacents(point)) {
            if (currentId != layer.get(sidePoint)) {
                return true
            }
        }
        return false
    }

    isBaseTerrain(point, baseTerrain) {
        if (baseTerrain === null || baseTerrain === undefined) {
            return true
        }
        return this.baseLayer.get(point) === baseTerrain
    }
}
