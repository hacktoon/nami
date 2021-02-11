import React, { useState, useRef } from 'react'

import { Point } from '/lib/base/point'
import { useResize } from '/lib/ui'
import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { Canvas } from '/lib/ui/canvas'

import { MapScene } from '/model/lib/scene'

import { MapMouseTrack } from './mouse'


export function MapSceneUI({diagram}) {
    const viewport = useRef(null)
    const [width, height] = useResize(viewport)

    const [prevFocus, setPrevFocus] = useState(new Point())
    const [data, setData] = useState(MapScene.schema.defaultValues())

    const scene = MapScene.create(diagram, width, height, data)

    const handleDragStart = () => setPrevFocus(scene.focus)
    const handleDrag = point => {
        setData(new Map([...data, ['focus', prevFocus.plus(point)]]))
    }
    const handleWheel = amount => {
        setData(new Map([...data, ['zoom', scene.zoom + amount]]))
    }
    const handleClick = point => console.info(point)

    return <section className="MapSceneUI">
        <section className="MapViewCanvasUI" ref={viewport}>
            {viewport.current && <>
                <MapMouseTrack
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
            schema={MapScene.schema}
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

