import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'


export class ZoneRiver {
    #layers
    #rect
    #points

    constructor(worldPoint, params) {
        // rect scaled to world size, for noise locality
        const ctx = {...params, worldPoint}
    }

    // #buildGrid(layers) {
    //     // reads the wire data and create points for zone grid
    //     const {layers, worldPoint, zoneRect} = context
    //     const midpoint = layers.basin.getMidpoint(worldPoint)
    //     const directions = layers.basin.getWirePathAxis(worldPoint)
    //     for(let directionAxis of directions) {
    //     }
    // }

    getZone(point) {

    }
}
