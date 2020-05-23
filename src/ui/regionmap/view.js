import React, { useState } from 'react'

import { Form } from '/lib/ui'
import { Color } from '/lib/color'
import { GridDisplay } from '/lib/ui/grid'
import {
    TextField,
    OutputField,
    NumberField,
    SwitchField
} from '/lib/ui/field'


const DEFAULT_TILE_SIZE = 5
const DEFAULT_LAYER = 0
const DEFAULT_FG = ''
const DEFAULT_BG = '#336'


function buildColor(string) {
    if (string === '') return
    return Color.fromHex(string)
}


class Render {
    constructor(regionMap, colorMap, fgColor, bgColor) {
        this.regionMap = regionMap
        this.colorMap = colorMap
        this.fgColor = buildColor(fgColor)
        this.bgColor = buildColor(bgColor) || new Color()
    }

    colorAt(point, viewlayer) {
        const region = this.regionMap.get(point)
        const id = region.id
        const fgColor = this.fgColor ? this.fgColor : this.colorMap[id]
        const pointLayer = this.regionMap.getLayer(point)

        if (this.regionMap.isBorder(point)) {
            return fgColor.darken(40).toHex()
        }
        if (this.regionMap.isOrigin(point)) {
            return fgColor.darken(60).toHex()
        }
        if (pointLayer == viewlayer) {
            return fgColor.brighten(50).toHex()
        }
        if (pointLayer > viewlayer) {
            return this.bgColor.toHex()
        }
        return fgColor.toHex()
    }
}


export default function RegionMapView({regionMap, colorMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)
    const [fgColor, setFGColor] = useState(DEFAULT_FG)
    const [bgColor, setBGColor] = useState(DEFAULT_BG)
    const [layer, setLayer] = useState(DEFAULT_LAYER)

    const render = new Render(regionMap, colorMap, fgColor, bgColor)

    return <section className="RegionMapView">
        <Menu
            onLayerChange={({value}) => setLayer(value)}
            onTilesizeChange={({value}) => setTilesize(value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            onFGColorChange={event => setFGColor(event.target.value)}
            onBGColorChange={event => setBGColor(event.target.value)}
            wrapMode={wrapMode}
            fgColor={fgColor}
            bgColor={bgColor}
            tilesize={tilesize}
            layer={layer}
            seed={regionMap.seed}
        />
        <GridDisplay
            width={regionMap.width}
            height={regionMap.height}
            colorAt={point => render.colorAt(point, layer)}
            tilesize={tilesize}
            wrapMode={wrapMode}
        />
    </section>
}


function Menu(props) {
    const onSubmit = event => event.preventDefault()

    return <Form className="Menu" onSubmit={onSubmit}>
        <OutputField label="Seed" value={props.seed} />
        <SwitchField
            label="Wrap grid"
            checked={props.wrapMode}
            onChange={props.onWrapModeChange}
        />
        <NumberField
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
        />
        <NumberField
            label="Layer"
            value={props.layer}
            onChange={props.onLayerChange}
            step={1}
            min={0}
        />
        <TextField
            label="FG color"
            value={props.fgColor}
            onChange={props.onFGColorChange}
        />
        <TextField
            label="BG color"
            value={props.bgColor}
            onChange={props.onBGColorChange}
        />
    </Form>
}