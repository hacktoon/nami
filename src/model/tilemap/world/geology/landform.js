import { Random } from '/lib/base/random'


const LANDFORMS = {
    SUMMIT: {
        name: 'SUMMIT', water: false, height: 7, color: '#DDD',
        erodesTo: 'PEAK'
    },
    PEAK: {
        name: 'PEAK', water: false, height: 6, color: '#AAA',
        erodesTo: 'MOUNTAIN', risesTo: 'SUMMIT', riseChance: .4
    },
    MOUNTAIN: {
        name: 'MOUNTAIN', water: false, height: 5, color: '#8b8372',
        erodesTo: 'HILL', risesTo: 'PEAK', riseChance: .05
    },
    HILL: {
        name: 'HILL', water: false, height: 4, color: '#585',
        erodesTo: 'PLAIN', risesTo: 'MOUNTAIN', riseChance: .1
    },
    PLAIN: {
        name: 'PLAIN', water: false, height: 3, color: '#574',
        erodesTo: 'SHALLOW_SEA', risesTo: 'HILL', riseChance: .01
    },
    HOTSPOT_GEYSER: {
        name: 'HOTSPOT_GEYSER', water: false, height: 4, color: '#764',
        erodesTo: 'PLAIN'
    },
    ISLAND: {
        name: 'ISLAND', water: false, height: 3, color: '#574',
        erodesTo: 'SHALLOW_SEA', risesTo: 'HILL', riseChance: .4
    },
    HOTSPOT_ISLAND: {
        name: 'HOTSPOT_ISLAND', water: false, height: 3, color: '#506545',
        erodesTo: 'SHALLOW_SEA', risesTo: 'HILL', riseChance: .4
    },
    DEPRESSION: {
        name: 'DEPRESSION', water: false, height: 2, color: '#4f664c',
        risesTo: 'SHALLOW_SEA', riseChance: .1
    },
    SHALLOW_SEA: {
        name: 'SHALLOW_SEA', water: true, height: 2, color: '#069',
        erodesTo: 'DEEP_SEA', risesTo: 'ISLAND', riseChance: .007
    },
    DEEP_SEA: {
        name: 'DEEP_SEA', water: true, height: 1, color: '#058',
        risesTo: 'SHALLOW_SEA', riseChance: .004
    },
    TRENCH: {
        name: 'TRENCH', water: true, height: 0, color: '#147'
    },
}


export class Landform {
    static get(name) {
        return LANDFORMS[name]
    }

    static getOceanicHotspot() {
        return LANDFORMS['HOTSPOT_ISLAND']
    }

    static getContinentalHotspot() {
        return LANDFORMS['HOTSPOT_GEYSER']
    }

    static canErode(centerLandform, sideLandform) {
        return centerLandform.height + 1 < sideLandform.height
    }

    static erode(centerLandform, sideLandform) {
        const name = sideLandform.erodesTo
        return LANDFORMS[name] ?? centerLandform
    }

    static rise(landform) {
        const name = landform.risesTo
        if (name) {
            const risenLandform = LANDFORMS[name] ?? landform
            if (Random.chance(landform.riseChance)) {
                return risenLandform
            }
        }
        return landform
    }
}