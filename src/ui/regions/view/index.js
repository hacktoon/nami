import React, { useState } from 'react'

import { FloodFill, ScanlineFill, ScanlineFill8 } from '/lib/flood-fill'
import Menu from './menu'
import { GridDisplay, RenderConfig } from '/ui/lib/display'


const DEFAULT_TILE_SIZE = 40

const methodOptions = {
    flood: FloodFill,
    scan4: ScanlineFill,
    scan8: ScanlineFill8,
}


export default function RegionsView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    const render = (canvas, viewWidth, viewHeight, offset) => {
        const config = new RenderConfig({ canvas, viewWidth, viewHeight, offset, tilesize })
        renderRegions(props.regions, config)
    }

    return <section className="RegionsView">
        <Menu
            onTilesizeChange={event => setTilesize(event.target.value)}
            tilesize={tilesize}
        />
        <GridDisplay render={render} />
    </section>
}


function renderRegions(regions, config) {
    const { canvas, tilesize, gridWidthSpan, gridHeightSpan, offset } = config

    const drawGridCell = (x, y, canvas, pt) => {
        const lineColor = '#EEE'
        const axisColor = '#222'
        const gridColor = 'red'
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

        if (pt.x == 20) {
            canvas.fillStyle = gridColor
            canvas.fillRect(x + tilesize, y, stroke, tilesize)
        }
        if (pt.y == regions.grid.height - 1) {
            canvas.fillStyle = gridColor
            canvas.fillRect(x, y + tilesize, tilesize, stroke)
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