import React, { useRef, useState, useLayoutEffect } from 'react'

import { Point } from '/lib/point'
import { Canvas } from '/ui/lib'
import { MouseTracking } from '/ui/lib'


export function View(props) {
    const [offset, setOffset] = useState(new Point(0, 0))

    return <section className="Screen">
        <Canvas painter={props.painter} offset={offset} />
        <MouseTracking onDrag={setOffset} />
    </section>
}


