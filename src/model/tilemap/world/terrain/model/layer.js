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
        this.layer = new TerrainLayerMatrix(baseLayer.rect)
    }

    buildLayer() {
        const noiseMap = this.noiseMaps.get(this.spec.noise.id)
        // create new layer based on previous
        this.baseLayer.forEach((point, currentId) => {
            this.buildPoint(point, currentId, noiseMap)
        })
        return this.layer
    }

    isRequiredTerrain(point) {
        if (this.spec.base === null || this.spec.base === undefined) {
            return true
        }
        return this.baseLayer.get(point) == this.spec.base
    }

    buildPoint(point, currentId, noiseMap) {
        // previous layer point is locked, reuse id and lock
        if (this.baseLayer.isBorder(point)) {
            this.layer.setBorder(point, currentId)
            return
        }
        const noise = noiseMap.getNoise(point)
        const enabled = this.isAboveRatio(noise) && this.isRequiredTerrain(point)
        const id = enabled ? this.spec.value : currentId
        if (this.isBorder(point, noise, noiseMap)) {
            this.layer.setBorder(point, id)
        } else {
            this.layer.set(point, id)
        }
    }

    isAboveRatio(noise) {
        return noise >= this.spec.ratio
    }

    isBorder(point, noise, noiseMap) {
        const isAboveRatio = this.isAboveRatio(noise)
        for (let sidePoint of Point.adjacents(point)) {
            const isSideBorder = this.baseLayer.isBorder(sidePoint)
            const isRequiredTerrain = this.isRequiredTerrain(sidePoint)
            if (isSideBorder || ! isRequiredTerrain)
                return true
            const sideNoise = noiseMap.getNoise(sidePoint)
            const isSideAboveRatio = this.isAboveRatio(sideNoise)
            const isHighBorder = isAboveRatio && ! isSideAboveRatio
            const isLowBorder = ! isAboveRatio && isSideAboveRatio
            if (isHighBorder || isLowBorder)
                return true
        }
        return false
    }
}
