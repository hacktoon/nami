import { SingleFill } from '/src/lib/floodfill/single'
import { Direction } from '/src/lib/math/direction'
import { Point } from '/src/lib/math/point'
import { Grid } from '/src/lib/grid'


const NO_RIVER_ID = null
const FILL_CHANCE = .2
const FILL_GROWTH = 3



export function buildRivers(gates, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { world, chunk, chunkRect, worldPoint } = context
    // map the chunk river gates by direction
    const gateMap = new Map(gates.map(gate => [gate.direction.id, gate]))
    const riverGrid = Grid.fromRect(chunkRect, () => NO_RIVER_ID)
    if (worldPoint[0] == 37 && worldPoint[1] == 37) {
        for (let river of world.basin.getRivers(worldPoint)) {
            const gate = gateMap.get(river.direction.id)
            fillRiver(gate, river, context)
        }
    }
    return
}


function fillRiver(gate, river, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunk, chunkRect, worldPoint } = context
    const { source, target, direction, isOutflow } = gate
    const fillContext = { ...context, gate }
    // console.log(river.direction.name, source, target, isOutflow)
    new RiverFill(source, fillContext).complete()
}


export class RiverFill extends SingleFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }

    onFill(fill, fillPoint, parentPoint) {

        // update distance to source at point

        // update parent point erosion path
        // will set the inflows directions

    }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        // const { world, model } = fill.context
        // return target.type.isWater == parent.type.isWater
        return false
    }
}
