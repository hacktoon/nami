import React, { useState } from 'react'

import { Point } from '/lib/point'
import { Canvas } from '/lib/ui/canvas'



export function GridView(props) {
    return <section className="GridView">

        <Canvas onSetup={onCanvasSetup} />
        <div className="BackgroundCanvas">
            <Canvas onSetup={onCanvasSetup} />
        </div>
    </section>
}
