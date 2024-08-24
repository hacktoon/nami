import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'


const EMPTY = null


export class RegionFloodFill extends ConcurrentFill {
    getNeighbors(fill, point) {
        return Point.adjacents(point)
    }

    getChance(fill) {
        return fill.context.chance
    }

    getGrowth(fill) {
        return fill.context.growth
    }

    onInitFill(fill, fillPoint, neighbors) {
        // center is the seed at center
        // point is neighbor being filled
        fill.context.regionGrid.set(fillPoint, fill.id)
        fill.context.levelGrid.set(fillPoint, fill.level)
        fill.context.colorMap.set(fill.id, new Color())
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, point, center) {
        // center is the seed at center
        // point is neighbor being filled
        fill.context.regionGrid.set(point, fill.id)
        fill.context.levelGrid.set(point, fill.level)
    }

    onBlockedFill(fill, neighbor, center) {
        const {borderMap, regionGrid, graph} = fill.context
        const neighborRegionId = regionGrid.get(neighbor)
        // it's same fill, do nothing
        if (fill.id === neighborRegionId) { return }
        const wrappedCenter = regionGrid.wrap(center)
        // create new set of neighbor regions by id
        // set the center as border since the neighbor isn't same fill
        if (! borderMap.has(wrappedCenter)) {
            borderMap.set(wrappedCenter, new Set())
        }
        // operations below are idempotent
        // mark neighbor point when it belongs to another region
        borderMap.get(wrappedCenter).add(neighborRegionId)
        graph.setEdge(fill.id, neighborRegionId)
    }
}
