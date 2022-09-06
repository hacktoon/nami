import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


export class OutlineNoiseStep {
    constructor(spec, baseLayer, noiseMaps) {
        this.spec = spec
        this.baseLayer = baseLayer
        this.noiseMaps = noiseMaps
    }

    buildLayer(filledMap) {
        const noiseMap = this.noiseMaps.get(this.spec.noise.id)
        // convert noise to terrain id
        const layer = Matrix.fromRect(this.baseLayer.rect, point => {
            const noise = noiseMap.getNoise(point)
            const notBorder = filledMap.get(point) === false
            const isOpenTerrain = this.isOpenTerrain(point)
            const isValid = isOpenTerrain && notBorder && noise >= this.spec.ratio
            return isValid ? this.spec.value : this.baseLayer.get(point)
        })
        // detect borders
        layer.forEach((point, currentId) => {
            for (let sidePoint of Point.adjacents(point)) {
                if (currentId != layer.get(sidePoint)) {
                    filledMap.set(point, true)
                    return
                }
            }
        })
        return layer
    }

    isOpenTerrain(point) {
        if (this.spec.base === null || this.spec.base === undefined) {
            return true
        }
        return this.baseLayer.get(point) === this.spec.base
    }
}
