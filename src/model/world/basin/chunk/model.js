import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointMap } from '/src/lib/geometry/point/map'
import { Grid } from '/src/lib/grid'
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
    return {typeGrid, pointflowMap}
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
    const {world, worldPoint, chunkRect, chunkSize} = context
    const fillMap = new Map()
    let id = 0

    const {cornerBitmap} = world.basin.get(worldPoint)
    // Fill setting level on river corners (diagonals)
    for (let dir of cornerBitmap) {
        const chunkPoint = dir.axis.map(coord => coord > 0 ? chunkSize-1 : 0)
        fillMap.set(id++, {origin: chunkPoint, startLevel: 1})
    }

    const grid = Grid.fromRect(chunkRect, chunkPoint => {
        if (pointFlowMap.has(chunkPoint)) {
            // start level grid from bottom valley (deep erosion flows)
            fillMap.set(id, {origin: chunkPoint, startLevel: 0})
        } else {
            // On diffuse basins, there's no flow. Start fill from midpoint instead
            const basin = world.basin.get(worldPoint)
            fillMap.set(id, {origin: basin.midpoint, startLevel: 4})
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
    const { chunk } = context
    if (! chunk.surface.isLand(point)) return OceanBasin
    if (level > 6) return HighLandChunkBasin
    if (level > 2) return LowLandChunkBasin
    if (level > 0) return FloodPlainChunkBasin
    return ValleyChunkBasin
}
// usar o traçado dos flows no oceano para criar zonas profundas


class BasinLevelFloodFill extends ConcurrentFill {
    getGrowth(fill) { return 2 }
    getChance(fill) { return .1 }

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
        let level = fill.level
        // if(fillPoint[0] == 5 && fillPoint[1] == 5) {
        //     console.log(level, fill.startLevel);
        // }
        if (level <= fill.startLevel) {
            level = fill.startLevel
        }
        grid.set(fillPoint, level)
    }
}