import React, { useState, useRef } from 'react'

import { Point } from '/lib/point'

import { useResize } from '/lib/ui'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Canvas } from '/lib/ui/canvas'
import { MapMouseTrack } from './mouse'

import { MapScene, Scene } from '/model/lib/scene'


export function MapSceneUI({diagram}) {
    const viewport = useRef(null)
    const [width, height] = useResize(viewport)

    const [focus, setFocus] = useState(new Point())
    const [zoom, setZoom] = useState(25)
    const [wrap, setWrap] = useState(false)

    const [offset, setOffset] = useState(new Point())
    const [baseOffset, setBaseOffset] = useState(new Point())

    const [data, setData] = useState(MapScene.schema.defaultValues())

    const mapScene = MapScene.create(diagram, width, height, data)

    const scene = new Scene(diagram, width, height, focus, zoom, wrap)

    const handleDrag = point => setOffset(point.plus(baseOffset))
    const handleDragEnd = point => setBaseOffset(point.plus(baseOffset))
    const handleClick = point => console.info(point.plus(offset))
    const handleWheel = amount => setZoom(zoom => zoom + amount)
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
            data={data}
            onSubmit={handleSubmit}
            schema={MapScene.schema}
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

