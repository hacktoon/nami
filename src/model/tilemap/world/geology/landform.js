import { Random } from '/lib/base/random'


export const LANDFORMS = {
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
    PLATEAU: {
        name: 'PLATEAU', water: false, height: 4, color: '#996',
        erodesTo: 'PLAIN'
    },
    HILL: {
        name: 'HILL', water: false, height: 4, color: '#585',
        erodesTo: 'PLAIN', risesTo: 'MOUNTAIN', riseChance: .1
    },
    PLAIN: {
        name: 'PLAIN', water: false, height: 3, color: '#574',
        erodesTo: 'SHALLOW_SEA', risesTo: 'HILL', riseChance: .01
    },
    ISLAND: {
        name: 'ISLAND', water: false, height: 3, color: '#574',
        erodesTo: 'SHALLOW_SEA', risesTo: 'HILL', riseChance: .4
    },
    DEPRESSION: {
        name: 'DEPRESSION', water: false, height: 2, color: '#352'
    },
    SHALLOW_SEA: {
        name: 'SHALLOW_SEA', water: true, height: 2, color: '#069',
        erodesTo: 'DEEP_SEA', risesTo: 'ISLAND', riseChance: .005
    },
    DEEP_SEA: {
        name: 'DEEP_SEA', water: true, height: 1, color: '#058',
        risesTo: 'SHALLOW_SEA', riseChance: .005
    },
    TRENCH: {
        name: 'TRENCH', water: true, height: 0, color: '#147'
    },
}


export class Landform {
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