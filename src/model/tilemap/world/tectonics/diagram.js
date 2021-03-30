import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMapDiagram } from '/model/lib/tilemap'


export class MapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'TectonicsMapDiagram',
        Type.boolean('showPlates', 'Show plates', {default: true}),
        Type.boolean('showProvinces', 'Show provinces', {default: true}),
    )

    static create(mapModel, params) {
        return new MapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.continent = params.get('continent')
        this.ocean = params.get('ocean')
        this.showPlates = params.get('showPlates')
        this.showProvinces = params.get('showProvinces')
        this.colorMap = new PlateColorMap(mapModel)
    }

    get(point) {
        const plate = this.mapModel.getPlate(point)
        const color = this.colorMap.get(plate)
        const isBorderProvince = this.mapModel.isBorderProvinceRegion(point)
        const isProvinceBorder = this.mapModel.isProvinceBorder(point)

        if (isProvinceBorder) {
            return color.darken(20).toHex()
        }
        // if (this.showPlates && this.mapModel.isPlateBorder(point)) {
        //     return color.darken(50).toHex()
        // }
        // // if (this.showProvinces && isBorderProvince) {
        // //     return color.darken(50).toHex()
        // // }
        // if (this.showProvinces && isBorderProvince) {
        //     const borderRegion = this.mapModel.getBorderProvinceRegion(point)
        //     const defColor = this.colorMap.get(borderRegion)
        //     return defColor.toHex()
        // }

        return color.toHex()
    }
    // get(point) {
    //     if (this.showBorder && this.mapModel.isBorder(point)) {
    //         return this.borderColor.toHex()
    //     }
    //     const value = this.mapModel.get(point)
    //     const ocean = this.ocean.toHex()
    //     const continent = this.continent.toHex()
    //     if (value === 0) return ocean
    //     if (value === 1) return '#27A'
    //     if (value === 2) return continent
    // }
}


class PlateColorMap {
    constructor(plateMap) {
        const entries = plateMap.map(plate => [plate.id, plate.color])
        this.map = Object.fromEntries(entries)
    }

    get(plate) {
        return this.map[plate.id]
    }
}
