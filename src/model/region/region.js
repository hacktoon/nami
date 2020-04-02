import { LightFloodFill } from '/lib/flood-fill'
import { PointMap, PointSet } from '/lib/point'
import { Color } from '/lib/color'


function growPoints(points) {
    const onFill = point => point
    const isFillable = point => true
    return new LightFloodFill(onFill, isFillable)
}


export class Region {
    constructor(grid, center) {
        this.grid = grid   //TODO: REMOVE
        this.center = center
        this.layers = [[center]]
        this.color = new Color(0, 100, 0)
        this.pointIndex = {}
    }

    grow(points) {
        let wrappedPoints = []
        points.forEach(rawPoint => {
            const point = this.grid.wrap(rawPoint)
            if (! this.hasPoint(point)) {
                this.pointIndex[point.hash] = this.layers.length
                wrappedPoints.push(point)
            }
        })
        this.layers.push(wrappedPoints)
    }

    hasPoint(point) {
        return this.pointIndex.hasOwnProperty(point.hash)
    }

    isCenter(point) {
        return point.equals(this.center)
    }

    layerIndex(point) {
        return this.pointIndex[point.hash]
    }

    inLayer(point, layer) {
        return this.layerIndex(point) == layer
    }

    inOuterLayer(point) {
        return this.inLayer(point, this.layers.length - 1)
    }

    pointsInLayer(layerIndex) {
        return this.layers[layerIndex]
    }

    outerLayerPoints() {
        return this.layers[this.layers.length - 1]
    }
}