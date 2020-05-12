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
    constructor(regions, layers, grid) {
        this.regions = regions
        this.layers = layers
        this.grid = grid
    }

    get(point) {
        const id = this.grid.get(point)
        const layer = this.layers[0]
        return layer.regions[id]
    }
}


class MapLayer {
    constructor(regions) {
        this.regions = regions
    }

    grow(rules) {
        let newRegions = []
        for(let region of this.regions) {
            rules.fillValue = region.id  // TODO: remove this
            const newPoints = rules.growFunction(region.points, rules)
            newRegions.push(region.grow(newPoints))
        }
        return new MapLayer(newRegions)
    }
}


class Region {
    constructor(id, origin, points) {
        this.id = id
        this.origin = origin
        this.pointHash = new PointHash(points)
        this.color = new Color()
    }

    get size() {
        return this.pointHash.size
    }

    get points() {
        return this.pointHash.points
    }

    isOrigin(point) {
        return this.origin.equals(point)
    }

    has(point) {
        return this.pointHash.has(point)
    }

    grow(points) {
        return new Region(this.id, this.origin, points)
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
    const layers = createLayers(regions, grid, rules)
    return new RegionMap(regions, layers, grid)
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


function createLayers(regions, grid, rules) {
    const layers = [new MapLayer(regions)]

    while(grid.hasEmptyPoints()) {
        let currentLayer = layers[layers.length - 1]
        layers.push(currentLayer.grow(rules))
    }
    return layers
}