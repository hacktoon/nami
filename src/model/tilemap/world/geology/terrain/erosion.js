import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'

import { Terrain } from '../data'


export class ErosionLayer {
    constructor(terrainLayer, props) {
        const context = {
            shorePoints: props.shorePoints,
            basinMap: new PairMap(),
            flowMap: new PairMap(),
            rect: props.rect,
            terrainLayer,
        }
        const phases = [
            Terrain.BASIN,
            Terrain.PLAIN,
            // Terrain.PLATEAU,
            // Terrain.MOUNTAIN,
            // Terrain.PEAK,
        ]
        let origins = props.shorePoints.points
        const fill = new ErosionConcurrentFill(origins, context, phases)
        fill.fill()
        this.nextPoints = new PointSet(fill.phaseSeedTable[43])
        this.basinMap = context.basinMap
        this.flowMap = context.flowMap
        this.basinCount = props.shorePoints.size
        this.rect = props.rect
    }

    getBasin(point) {
        return this.basinMap.get(...this.rect.wrap(point))
    }

    getErosionDirection(point) {
        const id = this.flowMap.get(...this.rect.wrap(point))
        return Direction.fromId(id)
    }
}

