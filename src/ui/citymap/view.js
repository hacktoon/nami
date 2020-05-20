import React, { useState } from 'react'

import { GridDisplay } from '/lib/ui/grid'
import { Form } from '/lib/ui'
import { Color } from '/lib/color'
import { OutputField, NumberField, SwitchField } from '/lib/ui/field'


const DEFAULT_TILE_SIZE = 5


function getColor(cityMap, point) {
    return new Color()
}


export default function CityMapView({cityMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)

    return <section className="CityMapView">
        <Menu
            onLayerChange={event => setLayer(Number(event.target.value))}
            onTilesizeChange={event => setTilesize(event.target.value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            wrapMode={wrapMode}
            tilesize={tilesize}
            seed={cityMap.seed}
        />
        <GridDisplay
            width={cityMap.width}
            height={cityMap.height}
            colorAt={point => getColor(cityMap, point)}
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
    </Form>
}