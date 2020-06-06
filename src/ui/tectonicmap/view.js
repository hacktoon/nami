import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { GridView } from '/lib/ui/grid'
import {
    TextField,
    OutputField,
    NumberField,
    BooleanField
} from '/lib/ui/form/field'


const DEFAULT_TILE_SIZE = 5


class Render {
    constructor(tectonicMap) {
        this.tectonicMap = tectonicMap
        // this.colorMap = colorMap
    }

    colorAt(point) {
        //const region = this.tectonicMap.get(point)
        return 'blue'
    }
}


export default function TectonicMapView({tectonicMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)

    const render = new Render(tectonicMap)

    return <section className="MapAppView">
        <Menu
            onTilesizeChange={({value}) => setTilesize(value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            wrapMode={wrapMode}
            tilesize={tilesize}
            seed={tectonicMap.seed}
        />
        <GridView
            width={tectonicMap.width}
            height={tectonicMap.height}
            colorAt={point => render.colorAt(point)}
            tilesize={tilesize}
            wrapMode={wrapMode}
        />
    </section>
}


function Menu(props) {
    const onSubmit = event => event.preventDefault()

    return <Form className="Menu" onSubmit={onSubmit}>
        <OutputField label="Seed" value={props.seed} />
        <BooleanField
            label="Wrap grid"
            value={props.wrapMode}
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