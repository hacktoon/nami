import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointMap } from '/src/lib/geometry/point/map'
import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/geometry/point'
import { clamp } from '/src/lib/function'

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


function buildPointFlowMap(baseContext) {
    // reads the direction bitmask data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = baseContext
    const pointFlowMap = new PointMap(chunkRect)
    const basin = world.basin.get(worldPoint)
    const source = basin.midpoint
    const midSize = Math.floor(chunk.size / 2)
    const context = {...baseContext, pointFlowMap}
    for(let direction of basin.directionBitmap) {
        const parentPoint = Point.atDirection(worldPoint, direction)
        const sideBasin = world.basin.get(parentPoint)
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        const target = direction.axis.map(coord => {
            if (coord < 0) return 0
            if (coord > 0) return chunk.size - 1
            return avgJoint
        })
        // generateFlowPath(context, source, target, direction)
        const distance = Point.distance(source, target)
        const pointsTooClose = distance < midSize
        const distortion = pointsTooClose ? 0 : MEANDER
        midpointDisplacement(chunkRect, source, target, distortion, point => {
            pointFlowMap.set(point, direction.id)
        })
    }
    // if(worldPoint[0] == 47 && worldPoint[1] == 17) {
    //     console.log(pointFlowMap.has([6, 6]));
    //     console.log(pointFlowMap.has([7, 7]));
    // }
    // if (worldPoint[0] == 47 && worldPoint[1] == 17)
    // console.log(pointFlowMap.get([6, 6]));
    return pointFlowMap
}


function generateFlowPath(context, source, target, direction) {
    const {chunkRect, pointFlowMap} = context
    const deltaX = Math.abs(source[0] - target[0])
    const deltaY = Math.abs(source[1] - target[1])
    const fixedAxis = deltaX > deltaY ? 0 : 1  // 0 for x, 1 for y
    const displacedAxis = fixedAxis === 0 ? 1 : 0
    // distance between source and target to fill with path
    const size = Math.abs(target[fixedAxis] - source[fixedAxis])
    const points = [source]
    let current = source
    pointFlowMap.set(target, direction.id)
    const [tx, ty] = target
    while (Point.differs(current, target)) {
        let [x, y] = current
        const [cx, cy] = current
        if (Random.chance(.8))
            x = cx > tx ? cx - 1 : (cx < tx ? cx + 1 : cx)
        if (Random.chance(.8))
            y = cy > ty ? cy - 1 : (cy < ty ? cy + 1 : cy)
        // console.log(current);
        current = [x, y]
        pointFlowMap.set(current, direction.id)
    }
    return points
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
        fillMap.set(id++, {origin: chunkPoint, basinLevel: 1})
    }

    const levelGrid = Grid.fromRect(chunkRect, chunkPoint => {
        const basin = world.basin.get(worldPoint)
        if (pointFlowMap.has(chunkPoint)) {
            // start level grid from bottom valley (deep erosion flows)
            fillMap.set(id, {origin: chunkPoint, basinLevel: 0})
        } else {
            // On diffuse basins, there's no flow. Start fill from midpoint instead
            // fillMap.set(id, {origin: basin.midpoint, basinLevel: 2})
        }
        // if (worldPoint[0] == 47 && worldPoint[1] == 17) {
        // if (chunkPoint[0] == 6 && chunkPoint[1] == 6) {
        //     console.log(x);
        // }
        // }
        id++
        return EMPTY
    })
    // if (worldPoint[0] == 47 && worldPoint[1] == 17)
    //     console.log(fillMap);
    const fillContext = {...context, levelGrid}
    new BasinLevelFloodFill(chunkRect, fillMap, fillContext).complete()
    return levelGrid
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
    if (level > 4 && level < 9) {
        return HighLandChunkBasin
        // if (Random.chance(.9))
    }
    if (level > 2) return LowLandChunkBasin
    if (level > 0) return FloodPlainChunkBasin
    return ValleyChunkBasin
}
// usar o traçado dos flows no oceano para criar zonas profundas


class BasinLevelFloodFill extends ConcurrentFill {
    getGrowth(fill) { return 2 }
    getChance(fill) { return .1 }

    getNeighbors(fill, parentPoint) {
        const {chunkRect} = fill.context
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in chunk rect - flood fill from borders to center
        return points.filter(p => chunkRect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.levelGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        const {levelGrid} = fill.context
        let level = fill.level + fill.basinLevel
        levelGrid.set(fillPoint, level)
    }
}


