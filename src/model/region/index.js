import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { normalFill, organicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'
import { Color } from '/lib/color'
import { RegionGrid } from './grid'


export const DEFAULT_COUNT = 15
export const DEFAULT_WIDTH = 150
export const DEFAULT_HEIGHT = 150


export class RegionMap {
    constructor(regions, grid) {
        this.regions = regions
        this.grid = grid
    }

    get(point) {
        const id = this.grid.get(point)
        return this.regions[id]
    }
}


class Region {
    constructor(id, origin, points) {
        this.id = id
        this.origin = origin
        this.layers = [new PointHash(points)]
        this.color = new Color()
    }

    get size() {
        //return this.layers.size
    }

    get points() {
        //return this.layers.points
    }

    isOrigin(point) {
        return this.origin.equals(point)
    }

    has(point) {
        return this.layers.has(point)
    }

    grow(rules) {
        rules.fillValue = this.id // TODO: remove
        const newPoints = rules.growFunction(this.lastPoints, rules)
        this.layers.push(new PointHash(newPoints))
    }

    get lastPoints() {
        const lastIndex = this.layers.length - 1
        return this.layers[lastIndex].points
    }
}


// FUNCTIONS ===================================

export function createRegionMap(params={}) {
    const {count, width, height, growth} = createConfig(params)
    const grid = new RegionGrid(width, height)
    const normalRules = {
        fill: (point, value) => grid.set(point, value),
        canFill: point => grid.isEmpty(point),
        growFunction: normalFill,
        fillValue: 0
    }
    const organicRules = {
        ...normalRules,
        chance: .2,
        times: Random.int(80),
        growFunction: organicFill
    }
    const rules = growth === 'organic' ? organicRules : normalRules
    const points = createPoints(count, width, height)
    const regions = createRegions(points)
    while(grid.hasEmptyPoints()) {
        growRegions(regions, rules)
    }
    return new RegionMap(regions, grid)
}


function createConfig(params={}) {
    const defaultParams = {
        count: DEFAULT_COUNT,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        growth: 'organic',
    }
    return Object.assign(defaultParams, params)
}


function createPoints(count, width, height) {
    return repeat(count, () => Point.random(width, height))
}


function createRegions(points) {
    return points.map((point, id) => new Region(id, point, [point]))
}


function growRegions(regions, rules) {
    for(let region of regions) {
        region.grow(rules)
    }
}