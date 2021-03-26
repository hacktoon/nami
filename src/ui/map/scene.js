import React, { useState, useRef } from 'react'

import { Point } from '/lib/base/point'
import { useResize } from '/ui'
import { Form } from '/ui/form'
import { Button } from '/ui/form/button'
import { Canvas } from '/ui/canvas'

import { MapScene } from '/model/lib/scene'

import { UIMouseMap } from './mouse'


export function UIMapScene({diagram}) {
    const viewport = useRef(null)
    const [width, height] = useResize(viewport)

    const [prevFocus, setPrevFocus] = useState(new Point())
    const [data, setData] = useState(MapScene.schema.parse())

    const scene = MapScene.create(diagram, width, height, data)

    const handleDragStart = () => setPrevFocus(scene.focus)
    const handleDrag = point => {
        const dragPoint = prevFocus.plus(point)
        setData(data.update('focus', dragPoint))
    }
    const handleWheel = amount => {
        const zoom = scene.zoom + amount
        setData(data.update('zoom', zoom))
    }
    const handleClick = point => console.info(point)

    return <section className="UIMapScene">
        <section className="UIMapViewCanvas" ref={viewport}>
            {viewport.current && <>
                <UIMouseMap
                    scene={scene}
                    onDrag={handleDrag}
                    onClick={handleClick}
                    onWheel={handleWheel}
                    onDragStart={handleDragStart}
                />
                <MapCanvas scene={scene} />
            </>}
        </section>
        <Form className="MapViewForm"
            data={data}
            onSubmit={setData}
        >
            <Button label="Update" />
        </Form>
    </section>
}


function MapCanvas({scene}) {
    const handleInit = canvas => scene.render(canvas)

    return <Canvas
        width={scene.width}
        height={scene.height}
        onInit={handleInit}
    />
}

