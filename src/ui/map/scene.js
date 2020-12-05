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

    const [offset, setOffset] = useState(new Point())
    const [baseOffset, setBaseOffset] = useState(new Point())
    const [zoom, setZoom] = useState(0)

    const frame = new Frame(diagram.tileSize, width, height)
    const scene = new Scene(diagram, frame)

    // const mapScene = new MapScene()

    const handleDrag = point => setOffset(point.plus(baseOffset))
    const handleDragEnd = point => setBaseOffset(point.plus(baseOffset))
    const handleClick = point => console.info(point.plus(offset))
    const handleWheel = amount => setZoom(zoom + amount)

    return <section className="MapSceneUI">
        <section className="MapViewCanvas" ref={viewport}>
            {viewport.current && <>
                <MapMouseTrack
                    scene={scene}
                    onDrag={handleDrag}
                    onClick={handleClick}
                    onDragEnd={handleDragEnd}
                    onWheel={handleWheel}
                />
                <MapCanvas scene={scene} offset={offset} zoom={zoom} />
            </>}
        </section>
        <Form className="MapViewForm"
            schema={MapScene.schema}
            data={MapScene.schema.defaultValues()}
        >
            <Button label="Update" />
        </Form>
    </section>
}


function MapCanvas({scene, offset, zoom}) {
    const handleInit = canvas => scene.render(canvas, offset, zoom)

    return <Canvas
        width={scene.width}
        height={scene.height}
        onInit={handleInit}
    />
}

