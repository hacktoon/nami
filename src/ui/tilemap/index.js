import React, { useState } from 'react'

import { Form } from '/ui/form'
import { Button } from '/ui/form/button'
import { Text } from '/ui'
import { TileMapScene } from '/model/lib/tilemap/scene'

import { UITileMapScene } from './scene'


export function UITileMap({TileMap}) {
    const [data, setData] = useState(TileMap.schema.parse())
    const tilemap = TileMap.create(data)

    return <section className='UITileMap'>
        <Form className="Map" data={data} onSubmit={setData}>
            <Button label="New" />
        </Form>
        <UITileMapDiagram diagram={TileMap.diagram} tilemap={tilemap} />
    </section>
}


function UITileMapDiagram({diagram, tilemap}) {
    const [diagramData, setDiagramData] = useState(diagram.schema.parse())
    const [sceneData, setSceneData] = useState(TileMapScene.schema.parse())

    const mapDiagram = diagram.create(tilemap, diagramData)

    const handleDrag = point => setSceneData(sceneData.update('focus', point))
    const handleWheel = zoom => setSceneData(sceneData.update('zoom', zoom))
    const handleClick = point => console.info('Click', point)

    return <>
        <UITileMapScene
            diagram={mapDiagram}
            sceneData={sceneData}
            handleDrag={handleDrag}
            handleWheel={handleWheel}
            handleClick={handleClick}
        />
        <section className="UIMapSidebar">
            <Text>Seed: {tilemap.seed}</Text>
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