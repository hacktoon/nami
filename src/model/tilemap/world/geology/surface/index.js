import { PointSet } from '/src/lib/point/set'

import { NoiseMapSet } from './noise'
import { OceanMap } from './ocean'
import { Terrain } from './schema'
import { ErosionLayer } from './erosion'
import { TerrainLayer } from './terrain'


export class SurfaceModel {
    #shorePoints
    #terrainLayer
    #oceanMap
    #erosionLayer

    constructor(rect, seed) {
        const props = {
            noiseMapSet: new NoiseMapSet(rect, seed),
            pointQueue: {water: [], land: []},
            borderPoints: new PointSet(),
            shorePoints: new PointSet(),
            oceanMap: new OceanMap(rect),
            rect,
        }
        this.rect = rect
        this.#shorePoints = props.shorePoints
        this.#oceanMap = props.oceanMap
        this.#terrainLayer = new TerrainLayer(props)
        this.#erosionLayer = new ErosionLayer(this.#terrainLayer, props)
    }

    get(point) {
        const id = this.#terrainLayer.get(point)
        return Terrain.fromId(id)
    }

    getErosionLevel(point) {
        return this.#erosionLayer.getErosionLevel(point)
    }

    getBasin(point) {
        return this.#erosionLayer.getBasin(point)
    }

    getBasinCount() {
        return this.#erosionLayer.basinCount
    }

    getFlowTarget(point) {
        return this.#erosionLayer.getFlowTarget(point)
    }

    isShore(point) {
        const wrappedPoint = this.rect.wrap(point)
        return this.#shorePoints.has(wrappedPoint)
    }

    isOcean(point) {
        return this.#oceanMap.isOcean(point)
    }
}
