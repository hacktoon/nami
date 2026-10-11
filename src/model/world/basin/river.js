import { Point } from '/src/lib/math/point'
import { Direction } from '/src/lib/math/direction'
import { Random } from '/src/lib/random'
import { HYDRO_NAMES } from '/src/lib/names'

import {
    HeadwaterStretch,
    TorrentStretch,
    RiffleStretch,
    MeanderStretch,
    DepositionalStretch,
    Stretch
} from './type'


export function buildRiverModel(context, model) {
    const riverNames = new Map()
    const sources = buildRiverSources(model, context)
    const pointMap = buildPointMap(sources, model, context)
    // init id grid for later use
    const riverMap = buildRiverMap(pointMap, context)
    const riverStretchMap = buildStretchMap(pointMap, model, { ...context, riverMap })
    // riverNames.set(id, Random.choice(HYDRO_NAMES))
    return { riverNames, riverMap, riverStretchMap }
}


function buildRiverSources(model, context) {
    // Start from river source point following the points
    // according to basin flow.
    const { world, rect } = context
    const sources = []
    rect.iterate((point, riverId) => {
        const isRainy = world.rain.canCreateRiver(point)
        const isDivide = model.erosionDirectionBitmask.get(point).length == 1
        if (isRainy && isDivide)
            sources.push([riverId, point])
    })
    return sources
}


function buildPointMap(sources, model, context) {
    // Start from river source point following the points
    // according to basin flow, storing point and erosion path.
    const { world } = context
    const pointMap = new Map()
    for (let [riverId, sourcePoint] of sources) {
        const riverPoints = []
        let nextPoint = sourcePoint
        let prevPoint = sourcePoint
        while (world.surface.isLand(nextPoint)) {
            const inflow = Point.directionBetween(nextPoint, prevPoint)
            const outflow = Direction.fromId(model.erosion.get(nextPoint))
            // not the first point, do not add inflow
            if (Point.differs(nextPoint, sourcePoint)) {
                // add the inflow spec, avoid setting on river source
                riverPoints.push([nextPoint, inflow])
            }
            // add the outflow spec, common for all river points
            riverPoints.push([nextPoint, outflow])
            // advance to next point
            prevPoint = nextPoint
            nextPoint = Point.atDirection(nextPoint, outflow)
        }
        pointMap.set(riverId, riverPoints)
    }
    return pointMap
}


function buildRiverMap(pointMap, context) {
    const { rect } = context
    const riverMap = new DirectionPairMap(rect)
    pointMap.forEach((riverPoints, candidateRiverId) => {
        for (let [point, flow] of riverPoints) {
            let riverId = candidateRiverId  //  set candidateRiverId by default
            if (riverMap.has(point, flow)) {  // river is already occupied
                const currentId = riverMap.get(point, flow)  // get current id if present
                const currentLength = pointMap.get(currentId).length  // get size of present river
                // if candidate river is greater than current, overwrite it
                if (riverPoints.length > currentLength) {
                    riverId = currentId
                }
            }
            riverMap.set(point, flow, riverId)
        }
    })
    return riverMap
}


function buildStretchMap(pointMap, model, context) {
    /*
    The Strahler stream order algorithm classifies the hierarchical size and branching structure of streams and rivers within a drainage basin
    */
    const { rect } = context
    const stretchMap = new DirectionPairMap(rect)
    pointMap.forEach((riverPoints, riverId) => {
        let stretchId = HeadwaterStretch.id  // initial value
        for (let [point, flow] of riverPoints) {
            let currentStretchId = stretchMap.get(point, flow)
            if (stretchMap.has(point, flow)) {
                if (stretchId < currentStretchId ) break
                if (stretchId == currentStretchId ) {
                    stretchId += 1
                }
            }
            stretchMap.set(point, flow, stretchId)
        }
    })
    return stretchMap
}


class DirectionPairMap {
    #map = new Map()
    #dataOffset
    #rect

    constructor(rect) {
        // Data space is the direction count
        const dataOffset = Direction.getAll().length
        if (!Number.isInteger(dataOffset) || dataOffset <= 0) {
            throw new RangeError(`Invalid data offset: ${dataOffset}`)
        }
        this.#dataOffset = dataOffset
        this.#rect = rect
    }

    get size() {
        return this.#map.size
    }

    #key(point, direction) {
        const rectIndex = this.#rect.pointToIndex(point)
        return rectIndex * this.#dataOffset + direction.id
    }

    get(point, direction) {
        return this.#map.get(this.#key(point, direction))
    }

    set(point, direction, value) {
        this.#map.set(this.#key(point, direction), value)
        return this
    }

    has(point, direction) {
        return this.#map.has(this.#key(point, direction))
    }

    delete(point, direction) {
        return this.#map.delete(this.#key(point, direction))
    }

    clear() {
        this.#map.clear()
    }

    forEach(callback) {
        const s = this.#dataOffset
        this.#map.forEach((value, key) => {
            callback(value, Math.floor(key / s), key % s)
        })
    }

    *entries() {
        const s = this.#dataOffset
        for (const [key, value] of this.#map) {
            yield [Math.floor(key / s), key % s, value]
        }
    }

    [Symbol.iterator]() {
        return this.entries()
    }
}
