import { Color } from '/src/lib/color'
import {
    drawBase,
    drawHydrothermalVents,
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


export class Landform {
    static HYDROTHERMAL_VENTS = Spec.build({
        name: 'Hydrothermal vents', color: "#75336a", draw: drawHydrothermalVents})
    static ATOL = Spec.build({
        name: 'Atol', color: '#85ffcc', draw: drawBase})
    static ICEBERGS = Spec.build({
        name: 'Icebergs', color: '#ffffff', draw: drawBase})
    static SANDBARS = Spec.build({
        name: 'Sand bars', color: '#fcff67', draw: drawBase})
    static REEFS = Spec.build({
        name: 'Reefs', color: '#3f4961', draw: drawBase})
    static DUNES = Spec.build({
        name: 'Dunes', color: '#c2b56c', draw: drawBase})
    static CANYON = Spec.build({
        name: 'Canyon', color: '#473d33', draw: drawBase})
    static MESA = Spec.build({
        name: 'Mesa', color: '#a77253', draw: drawBase})
    static VOLCANO = Spec.build({
        name: 'Volcano', color: '#ff0000', draw: drawBase})
    static RAVINE = Spec.build({
        name: 'Ravine', color: '#706262', draw: drawBase})
    static CRATER = Spec.build({
        name: 'Crater', color: '#79736c', draw: drawBase})

    static get(id) {
        return Spec.get(id)
    }
}




