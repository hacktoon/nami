import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/geometry/point'
import { PointSet } from '/src/lib/geometry/point/set'


export function buildRiverGrid(context) {
    // reads the wire data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = context
    const points = new PointSet(chunkRect)
    if (! (world.river.has(worldPoint) || world.surface.isWater(worldPoint))) {
        return points
    }
    Grid.fromRect(chunkRect, chunkPoint => {
        const basinChunk = chunk.basin.get(chunkPoint)
        if (basinChunk.type.allowsRiver) {
            points.add(chunkPoint)
        }
    })
    return points
}


function buildRiverMargins(context, points) {
    const {worldPoint, chunkRect} = context
    const fillMap = new Map(points.map((origin, id) => [id, {origin}]))
    new RiverFloodFill(fillMap, context).step()
    return {}
}


class RiverFloodFill extends ConcurrentFill {
    getGrowth() { return 1 }
    getChance() { return .5 }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    isEmpty(fill, fillPoint) {
        return fill.context.watermaskGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        fill.context.watermaskGrid.set(fillPoint, fill.id)
    }
}