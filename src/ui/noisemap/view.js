import React, { useState } from 'react'

import { SimplexNoise } from '/lib/noise'
import { GridDisplay } from '/lib/ui/grid'
import { Form } from '/lib/ui'
import { Color } from '/lib/color'
import { OutputField, NumberField, SwitchField } from '/lib/ui/field'


const DEFAULT_TILE_SIZE = 5
const simplex = new SimplexNoise()


function getColor(noiseMap, point) {
    // const region = noiseMap.get(point)
    let {x, y} = point
    const scale = .01
    const height = simplex.noise(8, x, y, .6, scale, 0, 255)
    return new Color(height, height, height).toHex()
}


export default function NoiseMapView({noiseMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)

    return <section className="NoiseMapView">
        <Menu
            onLayerChange={event => setLayer(Number(event.target.value))}
            onTilesizeChange={event => setTilesize(event.target.value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            wrapMode={wrapMode}
            tilesize={tilesize}
            seed={noiseMap.seed}
        />
        <GridDisplay
            width={noiseMap.width}
            height={noiseMap.height}
            colorAt={point => getColor(noiseMap, point)}
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