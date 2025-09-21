import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/geometry/point/set'
import { Grid } from '/src/lib/grid'
import { Rect } from '/src/lib/geometry/rect'
import { Point } from '/src/lib/geometry/point'
import { clamp } from '/src/lib/function'

import {
    OceanBasin,
    ValleyChunkBasin,
    FloodPlainChunkBasin,
    LowLandChunkBasin,
    HighLandChunkBasin,
} from '../type'


const MEANDER = 3
const EMPTY = null


export function buildModel(context) {
    const flowPoints = buildFlowPoints(context)
    const levelGrid = buildLevelGrid(context, flowPoints)
    const typeGrid = buildTypeGrid(context, levelGrid)
    return {typeGrid, flowPoints}
}


function buildFlowPoints(context) {
    // reads the direction bitmask data and create points for chunk grid
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


function buildLevelGrid(context, flowPoints) {
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
    new BasinLevelFloodFill(fillMap, fillContext).complete()
    return grid
}


function buildTypeGrid(context, levelGrid) {
    // reads the wire data and create points for chunk grid
    const {chunkRect} = context
    return Grid.fromRect(chunkRect, chunkPoint => {
        const level = levelGrid.get(chunkPoint)
        const type = buildType(context, chunkPoint, level)
        return type.id
    })
}


function buildType(context, point, level) {
    const {worldPoint, chunk, world, rect, chunkRect} = context
    if (! chunk.surface.isLand(point)) return OceanBasin

    const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
    const noiseRect = Rect.multiply(rect, chunkRect.width)
    const noisePoint = Point.plus(relativePoint, point)
    const noise = world.noise.get4DGrained(noiseRect, noisePoint)
    if (level > 5) {
        return noise > .5 ? HighLandChunkBasin : LowLandChunkBasin
    }
    if (level > 2) {
        return noise > .8 ? FloodPlainChunkBasin : LowLandChunkBasin
    }
    if (level > 0) return FloodPlainChunkBasin
    if (level == 0) return ValleyChunkBasin
}


class BasinLevelFloodFill extends ConcurrentFill {
    getGrowth() {
        return 2
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
        const {grid} = fill.context
        grid.set(fillPoint, fill.level)
    }
}