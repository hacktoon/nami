import React, { useState } from 'react'

import { Point } from '/lib/point'
import { Canvas, MouseTracking } from '/ui/lib/canvas'


export default function View(props) {
    const [offset, setOffset] = useState(new Point(0, 0))

    return <section className="View">
        <Canvas painter={props.painter} offset={offset} />
        <MouseTracking onDrag={setOffset} />
    </section>
}
