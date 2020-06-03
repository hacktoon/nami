import React, { useState } from 'react'

import { Form, Button } from '/lib/ui/form'
import { Color } from '/lib/color'
import { GridDisplay } from '/lib/ui/grid'
import {
    TextField,
    OutputField,
    NumberField,
    BooleanField
} from '/lib/ui/form/field'


const DEFAULT_TILE_SIZE = 5
const DEFAULT_LAYER = 15
const DEFAULT_FG = ''
const DEFAULT_BG = '#114'


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

    colorAt(point, viewlayer, border, origin) {
        const region = this.regionMap.get(point)
        const id = region.id
        const fgColor = this.fgColor ? this.fgColor : this.colorMap[id]
        const pointLayer = this.regionMap.getLayer(point)

        if (border && this.regionMap.isBorder(point)) {
            return fgColor.darken(40).toHex()
        }
        if (origin && this.regionMap.isOrigin(point)) {
            return fgColor.invert().toHex()
        }
        // draw seed
        if (this.regionMap.isLayer(point, viewlayer)) {
            return fgColor.brighten(50).toHex()
        }
        // invert this check to get remaining spaces
        if (this.regionMap.isOverLayer(point, viewlayer)) {
            return this.bgColor.toHex()
        }
        return fgColor.darken(pointLayer*10).toHex()
    }
}


export default function RegionMapView({regionMap, colorMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)
    const [fgColor, setFGColor] = useState(DEFAULT_FG)
    const [bgColor, setBGColor] = useState(DEFAULT_BG)
    const [layer, setLayer] = useState(DEFAULT_LAYER)
    const [border, setBorder] = useState(false)
    const [origin, setOrigin] = useState(false)

    const render = new Render(regionMap, colorMap, fgColor, bgColor)

    return <section className="MapAppView">
        <Menu
            onLayerChange={({value}) => setLayer(value)}
            onBorderChange={() => setBorder(!border)}
            onOriginChange={() => setOrigin(!origin)}
            onTilesizeChange={({value}) => setTilesize(value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            onFGColorChange={event => setFGColor(event.target.value)}
            onBGColorChange={event => setBGColor(event.target.value)}
            wrapMode={wrapMode}
            fgColor={fgColor}
            bgColor={bgColor}
            tilesize={tilesize}
            layer={layer}
            border={border}
            origin={origin}
            seed={regionMap.seed}
        />
        <GridDisplay
            width={regionMap.width}
            height={regionMap.height}
            colorAt={point => render.colorAt(point, layer, border, origin)}
            tilesize={tilesize}
            wrapMode={wrapMode}
        />
    </section>
}


function Menu(props) {
    return <Form className="Menu">
        <OutputField label="Seed" value={props.seed} />
        <BooleanField
            label="Wrap grid"
            checked={props.wrapMode}
            onChange={props.onWrapModeChange}
        />
        <BooleanField
            label="Show border"
            checked={props.border}
            onChange={props.onBorderChange}
        />
        <BooleanField
            label="Show origin"
            checked={props.origin}
            onChange={props.onOriginChange}
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
        <Button text="Update" />
    </Form>
}