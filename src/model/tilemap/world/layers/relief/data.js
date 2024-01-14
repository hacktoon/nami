import { Color } from '/src/lib/color'
import { drawIcon } from '/src/ui/tilemap/draw'


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
        name: 'Trench', color: '#11425a', draw: function(){}
    })
    static ABYSS = Spec.build({
        name: 'Abyss', color: '#185574', draw: function(){}
    })
    static OCEAN = Spec.build({
        name: 'Ocean', color: '#216384', draw: function(){}
    })
    static PLATFORM = Spec.build({
        name: 'Platform', color: '#2878a0', draw: function(){}
    })
    static PLAIN = Spec.build({
        name: 'Plain', color: '#66b169', draw: function(){}
    })
    static HILL = Spec.build({
        name: 'Hill', color: '#88BB88', draw: function(props) {
            drawIcon(props, [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 0, 0, 0],
                [0, 1, 0, 0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 0, 0],
                [0, 0, 0, 1, 0, 0, 1, 0],
                [0, 0, 1, 0, 0, 0, 0, 1],
                ], {
                1: Color.fromHex('#555'),
            })
        }
    })
    static MOUNTAIN = Spec.build({
        name: 'Mountain', color: '#badfba', draw: function(props) {
            drawIcon(props, [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0],
                [0, 0, 1, 2, 1, 0, 0, 0],
                [0, 1, 2, 3, 2, 1, 0, 0],
                [0, 1, 4, 3, 3, 1, 0, 0],
                [1, 4, 4, 3, 3, 1, 1, 0],
                [1, 4, 3, 3, 1, 4, 3, 1],
                [0, 0, 0, 1, 4, 3, 3, 1],
                ], {
                1: Color.fromHex('#444'),
                2: Color.fromHex('#eee'),
                3: Color.fromHex('#BBBBBB'),
                4: Color.fromHex('#727272'),
            })
        }
    })

    static get(id) {
        return Spec.get(id)
    }
}
