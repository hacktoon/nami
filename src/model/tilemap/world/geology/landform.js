
export const LANDFORMS = {
    SUMMIT: {
        name: 'SUMMIT', water: false, height: 7, color: '#DDD',
        erodesTo: 'PEAK'
    },
    PEAK: {
        name: 'PEAK', water: false, height: 6, color: '#AAA',
        erodesTo: 'MOUNTAIN', risesTo: 'SUMMIT'
    },
    MOUNTAIN: {
        name: 'MOUNTAIN', water: false, height: 5, color: '#8b8372',
        erodesTo: 'HILL'
    },
    PLATEAU: {
        name: 'PLATEAU', water: false, height: 4, color: '#996',
        erodesTo: 'PLAIN'
    },
    HILL: {
        name: 'HILL', water: false, height: 4, color: '#585',
        erodesTo: 'PLAIN'
    },
    PLAIN: {
        name: 'PLAIN', water: false, height: 3, color: '#574',
        erodesTo: 'SHALLOW_SEA'
    },
    ISLAND: {
        name: 'ISLAND', water: false, height: 3, color: '#685',
        erodesTo: 'SHALLOW_SEA'
    },
    DEPRESSION: {
        name: 'DEPRESSION', water: false, height: 2, color: '#352'
    },
    SHALLOW_SEA: {
        name: 'SHALLOW_SEA', water: true, height: 2, color: '#069',
        erodesTo: 'DEEP_SEA'
    },
    DEEP_SEA: {
        name: 'DEEP_SEA', water: true, height: 1, color: '#058'
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

    static rise(centerLandform) {
        const name = centerLandform.risesTo
        return LANDFORMS[name] ?? centerLandform
    }
}