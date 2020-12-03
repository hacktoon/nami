import React, { useState, useRef } from 'react'

import { useResize } from '/lib/ui'
import { Point } from '/lib/point'
import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Canvas, CursorCanvas } from '/lib/ui/canvas'
import { MouseTrack } from '/lib/ui/mouse'

import { MapScene, Scene } from '/model/lib/scene'


export function MapView({diagram}) {
    const viewport = useRef(null)

    const [width, height] = useResize(viewport)
    const [offset, setOffset] = useState(new Point())
    const [baseOffset, setBaseOffset] = useState(new Point())
    const [zoom, setZoom] = useState(0)

    const scene = new Scene(diagram, width, height)

    const handleDrag = point => setOffset(point.plus(baseOffset))
    const handleDragEnd = () => setBaseOffset(offset)
    const handleClick = point => console.info(point.plus(offset))
    const handleWheel = amount => setZoom(zoom + amount)

    return <section className="MapView">
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


function MapMouseTrack({scene, ...props}) {
    /*
     Translates MouseTrack events in pixel points to
     tile objects using a view frame object
    */

    const [cursor, setCursor] = useState(null)
    const [focus, setFocus] = useState(new Point())

    const handleDrag = (startPoint, endPoint) => {
        const startTilePoint = scene.frame.tilePoint(startPoint)
        const endTilePoint = scene.frame.tilePoint(endPoint)
        const newFocus = startTilePoint.minus(endTilePoint)
        if (newFocus.differs(focus)) {
            setFocus(newFocus)
            props.onDrag(newFocus)
        }
    }

    const handleDragEnd = (startPoint, endPoint) => {
        const startTilePoint = scene.frame.tilePoint(startPoint)
        const endTilePoint = scene.frame.tilePoint(endPoint)
        props.onDragEnd(startTilePoint.minus(endTilePoint))
    }

    const handleMove = mousePoint => {
        const scenePoint = scene.frame.tilePoint(mousePoint)
        const point = scenePoint.plus(scene.focus)
        if (! cursor || point.differs(cursor)) {
            setCursor(point)
        }
    }

    const handleClick = mousePoint => {
        const scenePoint = scene.frame.tilePoint(mousePoint)
        const point = scenePoint.plus(scene.focus)
        props.onClick(point)
    }

    const handleMouseOut = () => setCursor(null)

    const handleCanvasInit = canvas => {
        if (cursor) {
            scene.renderCursor(canvas, cursor)
        }
    }

    return <>
        <MouseTrack
            onClick={handleClick}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onMove={handleMove}
            onMouseOut={handleMouseOut}
            onWheel={props.onWheel}
        />
        <CursorCanvas
            width={scene.width}
            height={scene.height}
            onInit={handleCanvasInit}
        />
    </>
}

