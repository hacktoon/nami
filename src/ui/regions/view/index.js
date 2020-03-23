import React, { useState } from 'react'

import { FloodFill, ScanlineFill, ScanlineFill8 } from '/lib/flood-fill'
import { Random } from '/lib/base'
import { Grid } from '/lib/grid'
import Menu from './menu'
import { Display, RenderConfig } from '/ui/lib/display'


const DEFAULT_TILE_SIZE = 40

const methodOptions = {
    flood: FloodFill,
    scan4: ScanlineFill,
    scan8: ScanlineFill8,
}


export default function RegionsView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    let g

    const render = (canvas, width, height, offset) => {
        const config = new RenderConfig({ canvas, width, height, offset, tilesize })
        g = g || new Grid(config.gridWidth, config.gridHeight, () => Random.choice(['green', 'blue']))
        renderRegions(g, config)
    }

    return <section className="RegionsView">
        <Menu
            onTilesizeChange={event => setTilesize(event.target.value)}
            tilesize={tilesize}
        />
        <Display render={render} />
    </section>
}


function renderRegions(regions, config) {
    const { canvas, tilesize, gridWidth, gridHeight } = config

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
        } else if (pt.x == gridWidth - 1) {
            canvas.fillStyle = gridColor
            canvas.fillRect(x+tilesize, y, stroke, tilesize)
        }

        if (pt.y == 0) {
            canvas.fillStyle = axisColor
            canvas.fillRect(x, y, tilesize, stroke)
        } else if (pt.y == gridHeight - 1) {
            canvas.fillStyle = gridColor
            canvas.fillRect(x, y+tilesize, tilesize, stroke)
        }
    }

    for(let i = 0; i < gridWidth; i++) {
        for(let j = 0; j < gridHeight; j++) {
            const x = i * tilesize
            const y = j * tilesize
            const gridPoint = config.getGridPoint(i, j)

            canvas.fillStyle = regions.get(gridPoint)
            canvas.fillRect(x, y, tilesize, tilesize)
            drawGridCell(x, y, canvas, gridPoint)
        }
    }
}