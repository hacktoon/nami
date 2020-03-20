import React, { useState } from 'react'

import { Point } from '/lib/point'
import { Canvas, MouseTracker } from '/ui/lib/display'


export default function View(props) {
    const [offset, setOffset] = useState(new Point(0, 0))

    return <section className="View">
        <Canvas render={props.render} offset={offset} />
        <MouseTracker onDrag={setOffset} />
    </section>
}
