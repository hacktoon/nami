import { Color } from '/src/lib/color'

import {
    drawTrench,
    drawAbyss,
    drawOcean,
    drawPlatform,
    drawPlain,
    drawHill,
    drawMountain,
    drawPeak,
} from './draw'


class Spec {
    static total = 0
    static map = new Map()

    static build(spec) {
        const id = Spec.total++
        const item = {...spec, id, color: Color.fromHex(spec.color)}
        Spec.map.set(id, item)
        return item
    }

    static get(id) {
        return Spec.map.get(id)
    }
}


export class Relief {
    static TRENCH = Spec.build({
        name: 'Trench', color: '#11425a', draw: drawTrench
    })
    static ABYSS = Spec.build({
        name: 'Abyss', color: '#185574', draw: drawAbyss
    })
    static OCEAN = Spec.build({
        name: 'Ocean', color: '#216384', draw: drawOcean
    })
    static PLATFORM = Spec.build({
        name: 'Platform', color: '#2878a0', draw: drawPlatform
    })
    static PLAIN = Spec.build({
        name: 'Plain', color: '#66b169', draw: drawPlain
    })
    static HILL = Spec.build({
        name: 'Hill', color: '#88BB88', draw: drawHill
    })
    static MOUNTAIN = Spec.build({
        name: 'Mountain', color: '#95af8b', draw: drawMountain
    })
    static PEAK = Spec.build({
        name: 'Peak', color: '#badfba', draw: drawPeak
    })

    static get(id) {
        return Spec.get(id)
    }
}

