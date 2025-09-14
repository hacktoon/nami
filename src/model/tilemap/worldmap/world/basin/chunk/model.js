import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/geometry/point/set'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/geometry/point'
import { clamp } from '/src/lib/function'


const MEANDER = 3
const EMPTY = null


export function buildModel(context) {
    const flowPoints = buildFlowPoints(context)
    const grid = buildGrid(context, flowPoints)
    return {grid, flowPoints}
}


function buildFlowPoints(context) {
    // reads the wire data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = context
    const points = new PointSet(chunkRect)
    const basin = world.basin.get(worldPoint)
    const source = basin.midpoint
    const midSize = Math.floor(chunk.size / 2)
    for(let direction of basin.directionBitmap) {
        const parentPoint = Point.atDirection(worldPoint, direction)
        const sideBasin = world.basin.get(parentPoint)
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        const target = direction.axis.map(coord => {
            if (coord < 0) return 0
            if (coord > 0) return chunk.size - 1
            return avgJoint
        })
        const distance = Math.floor(Point.distance(source, target))
        const pointsTooClose = distance < midSize
        const distortion = pointsTooClose ? 1 : MEANDER
        midpointDisplacement(source, target, distortion, point => {
            const [x, y] = point
            points.add([
                clamp(x, 0, chunk.size - 1),
                clamp(y, 0, chunk.size - 1),
            ])
        })
    }
    return points
}


function buildGrid(context, flowPoints) {
    // reads the wire data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = context
    const fillMap = new Map()
    let id = 0
    const grid = Grid.fromRect(chunkRect, chunkPoint => {
        if (flowPoints.has(chunkPoint)) {
            fillMap.set(id, {id, origin: chunkPoint})
            id++
        }
        return EMPTY
    })
    const fillContext = {...context, grid}
    new BasinFloodFill(fillMap, fillContext).complete()
    return grid
}


class BasinFloodFill extends ConcurrentFill {
    getGrowth() {
        return 4
    }

    getChance() {
        return .1
    }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.chunkRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in chunk rect - flood fill from borders to center
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.grid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        const {grid, worldPoint, chunk, world, chunkRect} = fill.context
        const level = fill.level
        grid.set(fillPoint, level)
        const isChunkLand = chunk.surface.isLand(fillPoint)
        const isWorldBorder = world.surface.isBorder(worldPoint)
        if (world.surface.isLand(worldPoint)) {
            if (isWorldBorder) {
                if (level == 1) {

                }
            }
        } else {

        }
    }
}