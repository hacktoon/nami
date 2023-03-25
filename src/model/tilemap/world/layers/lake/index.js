import { PointMap } from '/src/lib/point/map'
import { Random } from '/src/lib/random'

import { HYDRO_NAMES } from '../../names'
import { Climate } from '../climate/data'
import { Rain } from '../rain/data'
import { RiverStretch } from '../river/data'
import { Biome } from '../biome/data'

import { Lake } from './data'


const LAKE_CHANCE = .5
const OASIS_CHANCE = .05
const SALT_LAKE_CHANCE = .08


export class LakeLayer {
    // maps an id to a name
    #names = new Map()
    // map a point to an id
    #lakes = new PointMap()
    #typeMap = new Map()

    constructor(layers) {
        let lakeId = 0
        for (let point of layers.basin.getDepressions()) {
            const type = this.#detectType(layers, point)
            if (type) {
                this.#names.set(lakeId, Random.choiceFrom(HYDRO_NAMES))
                this.#lakes.set(point, lakeId)
                this.#typeMap.set(lakeId, type.id)
                lakeId++
            }
        }
    }

    #detectType(layers, point) {
        const rain = layers.rain
        const isRiver = layers.river.has(point)
        if (layers.biome.is(point, Biome.DESERT) && !isRiver) {
            if (Random.chance(OASIS_CHANCE)) return Lake.OASIS
            if (Random.chance(SALT_LAKE_CHANCE)) return Lake.SALT
            return null
        }
        if (Random.chance(LAKE_CHANCE)) {
            if (layers.climate.is(point, Climate.FROZEN)) {
                return Lake.FROZEN
            }
            if (rain.is(point, Rain.HUMID)) return Lake.SWAMP
            const isDepositional = layers.river.is(point, RiverStretch.DEPOSITIONAL)
            if (isRiver && isDepositional) {
                return Lake.ESTUARY
            }
            return Lake.FRESH
        }
        return null
    }

    get count() {
        return this.#names.size
    }

    has(point) {
        return this.#lakes.has(point)
    }

    get(point) {
        const id = this.#lakes.get(point)
        return {
            id,
            name: this.#names.get(id),
            type: Lake.get(this.#typeMap.get(id)),
        }
    }

    is(point, type) {
        if (! this.#lakes.has(point)) return false
        const id = this.#lakes.get(point)
        return id === type.id
    }

    getText(point) {
        if (! this.has(point))
            return ''
        const lake = this.get(point)
        const attrs = [
             `name=${lake.name}`,
             `type=${lake.type.name}`,
        ].join(',')
        return `Lake(${attrs})`
    }
}
