import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointMap } from '/src/lib/geometry/point/map'
import { Grid } from '/src/lib/grid'
import { Rect } from '/src/lib/geometry/rect'
import { Point } from '/src/lib/geometry/point'

import {
    OceanBasin,
    ValleyChunkBasin,
    FloodPlainChunkBasin,
    LowLandChunkBasin,
    HighLandChunkBasin,
} from '../type'


const MEANDER = 2
const EMPTY = null


export function buildModel(context) {
    const pointflowMap = buildPointFlowMap(context)
    const levelGrid = buildLevelGrid(context, pointflowMap)
    const typeGrid = buildTypeGrid(context, levelGrid)
    const flowEdgePoints = buildFlowEdgePoints(context)
    return {typeGrid, pointflowMap}
}

function buildFlowPoints(context) {
    // reads the direction bitmask data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = context
    const pointFlowMap = new PointMap(chunkRect)
    return pointFlowMap
}

function buildFlowEdgePoints(context) {
    const {world, worldPoint, chunk} = context
    const basin = world.basin.get(worldPoint)
    const pairs = []

    function buildChunkEdgePoint(direction) {
        const parentPoint = Point.atDirection(worldPoint, direction)
        const sideBasin = world.basin.get(parentPoint)
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        return direction.axis.map(coord => {
            if (coord < 0) return 0
            if (coord > 0) return chunk.size - 1
            return avgJoint
        })
    }
    const outflowEdge = buildChunkEdgePoint(basin.erosion)
    for(const direction of basin.directionBitmap) {
        if (basin.isDivide) {
            pairs.push([basin.midpoint, outflowEdge])
            // if(worldPoint[0] == 27 && worldPoint[1] == 29) {
            //     console.log(`${basin.midpoint}, ${outflowEdge} ${direction.name}`);
            // }
        } else if (direction.id != basin.erosion.id) {
            const source = buildChunkEdgePoint(direction)
            pairs.push([source, outflowEdge])
            // if(worldPoint[0] == 29 && worldPoint[1] == 29) {
            //     console.log(`${source}, ${outflowEdge} ${direction.name}`);
            // }
        }
    }
    return pairs
}

function buildPointFlowMap(context) {
    // reads the direction bitmask data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = context
    const pointFlowMap = new PointMap(chunkRect)
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
        const distortion = pointsTooClose ? 0 : MEANDER
        midpointDisplacement(chunkRect, source, target, distortion, point => {
            pointFlowMap.set(point, direction.id)
        })
    }
    return pointFlowMap
}


function buildLevelGrid(context, pointFlowMap) {
    // reads the path points in basin to help create basin relief
    const {world, worldPoint, chunkRect} = context
    const fillMap = new Map()
    let id = 0
    const grid = Grid.fromRect(chunkRect, chunkPoint => {
        if (pointFlowMap.has(chunkPoint)) {
            // start level grid from bottom valley (deep erosion flows)
            fillMap.set(id, {origin: chunkPoint})
        } else {
            // On diffuse basins, there's no flow. Start fill from midpoint instead
            const basin = world.basin.get(worldPoint)
            fillMap.set(id, {origin: basin.midpoint})
        }
        id++
        return EMPTY
    })
    const fillContext = {...context, grid, pointFlowMap}
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
    getGrowth() { return 2 }
    getChance() { return .1 }

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