import React, { useState, useRef } from 'react'

import { Point } from '/lib/point'
import { useResize } from '/lib/ui'
import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Canvas } from '/lib/ui/canvas'

import { MapScene } from '/model/lib/scene'

import { MapMouseTrack } from './mouse'


export function MapSceneUI({diagram}) {
    const viewport = useRef(null)
    const [width, height] = useResize(viewport)

    const [zoom, setZoom] = useState(0)

    const [baseOffset, setBaseOffset] = useState(new Point())
    const [offset, setOffset] = useState(new Point())

    const [data, setData] = useState(MapScene.schema.defaultValues())

    const scene = MapScene.create(diagram, width, height, data)

    const handleDrag = point => setOffset(point.plus(baseOffset))
    const handleDragEnd = point => setBaseOffset(point.plus(baseOffset))
    const handleClick = point => console.info(point.plus(offset))
    const handleWheel = amount => {
        setZoom(zoom => zoom + amount)
        const m = new Map([...data, ['zoom', zoom + amount]])
        // console.log(m);
        setData(m)
    }
    const handleSubmit = data => setData(data)

    const handleRenderCursor = (canvas, cursor) => scene.renderCursor(canvas, cursor)

    return <section className="MapSceneUI">
        <section className="MapViewCanvasUI" ref={viewport}>
            {viewport.current && <>
                <MapMouseTrack
                    scene={scene}
                    onDrag={handleDrag}
                    onClick={handleClick}
                    onWheel={handleWheel}
                    onDragEnd={handleDragEnd}
                    onRenderCursor={handleRenderCursor}
                />
                <MapCanvas scene={scene} offset={offset} />
            </>}
        </section>
        <Form className="MapViewForm"
            schema={MapScene.schema}
            data={data}
            onSubmit={handleSubmit}
        >
            <Button label="Update" />
        </Form>
    </section>
}


function MapCanvas({scene, offset}) {
    const handleInit = canvas => scene.render(canvas, offset)

    return <Canvas
        width={scene.width}
        height={scene.height}
        onInit={handleInit}
    />
}

