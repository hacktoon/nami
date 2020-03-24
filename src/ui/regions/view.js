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
            render={config => render(props.regions, config)}
            tilesize={tilesize}
        />
    </section>
}


function render(regions, renderMap) {
    for(let i = 0; i < renderMap.gridWidthSpan; i++) {
        for(let j = 0; j < renderMap.gridHeightSpan; j++) {
            const x = i * renderMap.tilesize
            const y = j * renderMap.tilesize
            const gridPoint = renderMap.getGridPoint(i, j)

            renderMap.drawCell(x, y, regions.grid.get(gridPoint))
            renderMap.drawBorders(x, y, gridPoint)
            renderMap.drawText(x, y, "#FFF", gridPoint.hash())
        }
    }
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
        <TextField
            label="Fill color"
        />
        <TextField
            label="Border color"
        />
    </Form>
}