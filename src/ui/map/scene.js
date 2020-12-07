import React, { useState, useRef } from 'react'

import { Point } from '/lib/point'

import { useResize } from '/lib/ui'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Canvas } from '/lib/ui/canvas'
import { MapMouseTrack } from './mouse'

import { MapScene, Scene } from '/model/lib/scene'
import { Frame } from '/model/lib/frame'


export function MapSceneUI({diagram}) {
    const viewport = useRef(null)
    const [width, height] = useResize(viewport)

    const [focus, setFocus] = useState(new Point())
    const [zoom, setZoom] = useState(25)
    const [offset, setOffset] = useState(new Point())
    const [baseOffset, setBaseOffset] = useState(new Point())

    const [data, setData] = useState(MapScene.schema.defaultValues())

    // const mapScene = new MapScene()

    const frame = new Frame(width, height, focus, zoom)
    const scene = new Scene(diagram, frame)

    const handleDrag = point => setOffset(point.plus(baseOffset))
    const handleDragEnd = point => setBaseOffset(point.plus(baseOffset))
    const handleClick = point => console.info(point.plus(offset))
    const handleWheel = amount => setZoom(zoom + amount)
    const handleSubmit = data => setData(data)

    const handleRenderCursor = (canvas, cursor) => scene.renderCursor(canvas, cursor)

    return <section className="MapSceneUI">
        <section className="MapViewCanvasUI" ref={viewport}>
            {viewport.current && <>
                <MapMouseTrack
                    frame={frame}
                    onDrag={handleDrag}
                    onClick={handleClick}
                    onDragEnd={handleDragEnd}
                    onWheel={handleWheel}
                    onRenderCursor={handleRenderCursor}
                />
                <MapCanvas scene={scene} frame={frame} offset={offset} />
            </>}
        </section>
        <Form className="MapViewForm"
            schema={MapScene.schema}
            data={MapScene.schema.defaultValues()}
            onSubmit={handleSubmit}
        >
            <Button label="Update" />
        </Form>
    </section>
}


function MapCanvas({scene, frame, offset}) {
    const handleInit = canvas => scene.render(canvas, frame.focus, offset)

    return <Canvas
        width={scene.width}
        height={scene.height}
        onInit={handleInit}
    />
}

