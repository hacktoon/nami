import React, { useState } from 'react'

import { Form } from '/ui/form'
import { Button } from '/ui/form/button'
import { MapScene } from '/model/lib/map/scene'

import { UIMapScene } from './scene'


export function UIMap({model}) {
    const [data, setData] = useState(model.schema.parse())
    const map = model.create(data)

    return <section className='UIMap'>
        <Form className="Map" data={data} onSubmit={setData}>
            <Button label="New" />
        </Form>
        <UIMapDiagram diagram={model.diagram} map={map} />
    </section>
}


function UIMapDiagram({diagram, map}) {
    const [diagramData, setDiagramData] = useState(diagram.schema.parse())
    const [sceneData, setSceneData] = useState(MapScene.schema.parse())

    const mapDiagram = diagram.create(map, diagramData)

    const handleDrag = point => setSceneData(sceneData.update('focus', point))
    const handleWheel = zoom => setSceneData(sceneData.update('zoom', zoom))
    const handleClick = point => console.info('Click', point)

    return <>
        <UIMapScene
            diagram={mapDiagram}
            sceneData={sceneData}
            handleDrag={handleDrag}
            handleWheel={handleWheel}
            handleClick={handleClick}
        />
        <section className="UIMapSidebar">
            <Form className="MapSceneForm"
                data={sceneData}
                onSubmit={setSceneData}>
            </Form>
            <Form className="MapDiagramForm"
                data={diagramData}
                onSubmit={setDiagramData}>
            </Form>
        </section>
    </>
}