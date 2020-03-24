import React, { useState } from 'react'

import { FloodFill, ScanlineFill, ScanlineFill8 } from '/lib/flood-fill'
import Menu from './menu'
import { GridDisplay } from '/ui/lib/display'


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


function render(regions, config) {
    const { canvas, tilesize, gridWidthSpan, gridHeightSpan } = config

    const drawGridCell = (x, y, canvas, pt) => {
        const lineColor = '#EEE'
        const axisColor = '#222'
        const stroke = 5

        canvas.fillStyle = lineColor
        canvas.fillRect(x, y, 1, tilesize)
        canvas.fillRect(x, y, tilesize, 1)

        if (pt.x == 0) {
            canvas.fillStyle = axisColor
            canvas.fillRect(x, y, stroke, tilesize)
        }
        if (pt.y == 0) {
            canvas.fillStyle = axisColor
            canvas.fillRect(x, y, tilesize, stroke)
        }
    }

    for(let i = 0; i < gridWidthSpan; i++) {
        for(let j = 0; j < gridHeightSpan; j++) {
            const x = i * tilesize
            const y = j * tilesize
            const gridPoint = config.getGridPoint(i, j)

            canvas.fillStyle = regions.grid.get(gridPoint)
            canvas.fillRect(x, y, tilesize, tilesize)
            drawGridCell(x, y, canvas, gridPoint)
        }
    }

}