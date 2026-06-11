import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/math/point'
import { Grid } from '/src/lib/grid'

import { LAND_BORDER } from './model'


const EMPTY = null


export function buildLevelGrid(context, model) {
    const { worldPoint, world, rect, chunkRect, chunkSize } = context
    const landBorders = []
    // init grid and dectect seeds
    const levelGrid = Grid.fromRect(chunkRect, chunkPoint => {
        const type = model.surface.get(chunkPoint)
        if (type == LAND_BORDER)
            landBorders.push(chunkPoint)
        return EMPTY
    })
    const origins = landBorders
    const fillMap = new Map(landBorders.map((origin, id) => {
        return [id, { origin }]  // Map entry
    }))
    // Each chunk point has a region ID

    const fillContext = { ...context, levelGrid }
    new LevelFloodFill(chunkRect, fillMap, fillContext).complete()
    return levelGrid
}


class LevelFloodFill extends ConcurrentFill {
    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    isEmpty(fill, fillPoint) {
        return fill.context.levelGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        fill.context.levelGrid.set(fillPoint, fill.level)
    }
}
