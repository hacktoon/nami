import React, { useState } from 'react'

import { FloodFill, ScanlineFill, ScanlineFill8 } from '/lib/flood-fill'
import { GridDisplay } from '/ui/lib/display'
import { Form } from '/ui/lib'
import { NumberField, TextField } from '/ui/lib/field'


const DEFAULT_TILE_SIZE = 40

const methodOptions = {
    flood: FloodFill,
    scan4: ScanlineFill,
    scan8: ScanlineFill8,
}


export default function RegionsView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    return <section className="RegionsView">
        <Menu
            onTilesizeChange={event => setTilesize(event.target.value)}
            tilesize={tilesize}
        />
        <GridDisplay
            drawGrid drawPoints
            render={point => props.regions.grid.get(point)}
            tilesize={tilesize}
        />
    </section>
}


function Menu(props) {
    return <Form className="Menu">
        <NumberField
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
        />
        <TextField label="Fill color" />
        <TextField label="Border color" />
    </Form>
}