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
        this.#erosionLayer = new ErosionLayer(
            this.#terrainLayer,
            this.#oceanMap,
            props
        )
    }

    get(point) {
        const id = this.#terrainLayer.get(point)
        return Terrain.fromId(id)
    }

    getBasin(point) {
        const wrappedPoint = this.rect.wrap(point)
        return this.#erosionLayer.getBasin(wrappedPoint)
    }

    getBasinCount() {
        return this.#erosionLayer.basinCount
    }

    getFlowTarget(point) {
        const wrappedPoint = this.rect.wrap(point)
        return this.#erosionLayer.getFlowTarget(wrappedPoint)
    }

    isShore(point) {
        const wrappedPoint = this.rect.wrap(point)
        return this.#shorePoints.has(wrappedPoint)
    }

    isOcean(point) {
        return this.#oceanMap.isOcean(point)
    }
}
