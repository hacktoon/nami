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
        fill.context.regionMatrix.set(fillPoint, fill.id)
        fill.context.growthMatrix.set(fillPoint, fill.growth)
        fill.context.levelMatrix.set(fillPoint, fill.level)
        fill.context.colorMap.set(fill.id, new Color())
    }

    canFill(fill, point, center) {
        return fill.context.regionMatrix.get(point) === EMPTY
    }

    onFill(fill, point, center) {
        // center is the seed at center
        // point is neighbor being filled
        fill.context.regionMatrix.set(point, fill.id)
        fill.context.growthMatrix.set(point, fill.growth)
        fill.context.levelMatrix.set(point, fill.level)
    }

    onBlockedFill(fill, neighbor, center) {
        const {borderMap, regionMatrix, graph} = fill.context
        const neighborRegionId = regionMatrix.get(neighbor)
        // it's same fill, do nothing
        if (fill.id === neighborRegionId) { return }
        const point = regionMatrix.wrap(center)
        // create new set of neighbor regions by id
        // set the center as border since the neighbor isn't same fill
        if (! borderMap.has(point)) {
            borderMap.set(point, new Set())
        }
        // mark region when neighbor point belongs to another region
        // these operations are idempotent
        borderMap.get(point).add(neighborRegionId)
        graph.setEdge(fill.id, neighborRegionId)
    }
}
