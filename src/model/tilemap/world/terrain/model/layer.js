import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'


export class TerrainLayerMatrix extends Matrix {
    constructor(rect, buildValue) {
        const {width, height} = rect
        super(width, height, buildValue)
    }

    get(point) {
        return Math.abs(super.get(point))
    }

    set(point, id) {
        // save only positive id values = unlocked
        super.set(point, Math.abs(id))
    }

    setBorder(point, id) {
        // border points have negative ids
        super.set(point, - Math.abs(id))
    }

    isBorder(point) {
        return super.get(point) < 0
    }
}


export class OutlineNoiseStep {
    constructor(spec, baseLayer, noiseMaps) {
        this.spec = spec
        this.baseLayer = baseLayer
        this.noiseMaps = noiseMaps
    }

    buildLayer() {
        // create fill map
        const noiseMap = this.noiseMaps.get(this.spec.noise.id)
        // convert from noise
        const layer = new TerrainLayerMatrix(this.baseLayer.rect, point => {
            const noise = noiseMap.getNoise(point)
            const notBorder = ! this.baseLayer.isBorder(point)
            const isOpenTerrain = this.isOpenTerrain(point)
            const isValid = isOpenTerrain && notBorder && noise >= this.spec.ratio
            return isValid ? this.spec.value : this.baseLayer.get(point)
        })
        // discover borders
        layer.forEach(point => {
            const currentId = layer.get(point)
            for (let sidePoint of Point.adjacents(point)) {
                if (currentId != layer.get(sidePoint)) {
                    layer.setBorder(point, currentId)
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
