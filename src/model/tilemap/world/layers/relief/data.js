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
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                ], {
                1: Color.fromHex('#77a777'),
            })
        }
    })
    static MOUNTAIN = Spec.build({
        name: 'Mountain', color: '#95af8b', draw: function(props) {
            drawIcon(props, [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 2, 2, 0],
                [0, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
                ], {
                1: Color.fromHex('#788057'),
                2: Color.fromHex('#8b845d'),
            })
        }
    })
    static PEAK = Spec.build({
        name: 'Peak', color: '#badfba', draw: function(props) {
            drawIcon(props, [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 2, 2, 2, 0],
                [3, 3, 3, 3, 3],
                ], {
                1: Color.fromHex('#eee'),
                2: Color.fromHex('#BBBBBB'),
                3: Color.fromHex('#AAAAAA'),
            })
        }
    })

    static get(id) {
        return Spec.get(id)
    }
}
