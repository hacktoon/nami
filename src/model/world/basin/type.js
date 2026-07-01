import { Color } from '/src/lib/color'


export class Basin {
    static parse(id) {
        return BASIN_MAP[id]
    }
}


export class ExorheicBasin extends Basin {
    static id = 0
    static name = 'Exorheic river'
    static reach = Infinity
    static color = Color.fromHex('#38a378')
}


export class EndorheicSeaBasin extends Basin {
    static id = 1
    static name = 'Endorheic sea'
    static reach = 2
    static color = Color.fromHex('#7fc3c5')
}


export class EndorheicLakeBasin extends Basin {
    static id = 2
    static name = 'Endorheic lake'
    static reach = 1
    static color = Color.fromHex('#6caca1')
}


export class OceanBasin extends Basin {
    static id = 3
    static name = 'Ocean'
    static reach = Infinity
    static color = Color.fromHex('#285879')
}


export class RiverStretch {
    static HEADWATERS = Spec.build({
        name: 'Headwaters', width: .05, color: '#2893c1'
    })
    static FAST_COURSE = Spec.build({
        name: 'Fast course', width: .1, color: '#2a83af'
    })
    static SLOW_COURSE = Spec.build({
        name: 'Slow course', width: .15, color: '#26749b'
    })
    static DEPOSITIONAL = Spec.build({
        name: 'Depositional', width: .2, color: '#216384'
    })

}

