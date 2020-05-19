import React, { useState } from 'react'

import { Form } from '/lib/ui'
import { GridDisplay } from '/lib/ui/grid'
import {
    TextField,
    OutputField,
    NumberField,
    SwitchField
} from '/lib/ui/field'


const DEFAULT_TILE_SIZE = 5

class Render {
    constructor(regionMap, colorMap, bgColor) {
        this.regionMap = regionMap
        this.colorMap = colorMap
        this.bgColor = bgColor
    }

    color(point, layer) {
        const region = this.regionMap.get(point)
        const color = this.colorMap[region.id]

        if (this.regionMap.getLayer(point) > Number(layer)) {
            return this.bgColor
        }
        if (this.regionMap.isBorder(point)) {
            return color.darken(40).toHex()
        }
        if (this.regionMap.isOrigin(point)) {
            return 'black'
        }
        return color.toHex()
    }
}


export default function RegionMapView({regionMap, colorMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)
    const [layer, setLayer] = useState(0)
    const [bgColor, setBGColor] = useState('#FFF')

    const render = new Render(regionMap, colorMap, bgColor)

    return <section className="RegionMapView">
        <Menu
            onLayerChange={event => setLayer(Number(event.target.value))}
            onTilesizeChange={event => setTilesize(event.target.value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            onBgColorChange={event => setBGColor(event.target.value)}
            wrapMode={wrapMode}
            bgColor={bgColor}
            tilesize={tilesize}
            layer={layer}
            seed={regionMap.seed}
        />
        <GridDisplay
            width={regionMap.width}
            height={regionMap.height}
            colorAt={point => render.color(point, layer)}
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
            label="BG color"
            value={props.bgColor}
            onChange={props.onBgColorChange}
        />
    </Form>
}