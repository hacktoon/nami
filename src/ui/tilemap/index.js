import React, { useState } from 'react'

import { Point } from '/lib/base/point'
import { Form } from '/ui/form'
import { Button } from '/ui/form/button'
import { Text } from '/ui'
import { TileMapScene } from '/lib/model/tilemap/scene'

import { UITileMapScene } from './scene'


export function UITileMap({TileMap}) {
    const [data, setData] = useState(TileMap.schema.build())
    const tileMap = TileMap.create(data)

    return <section className='UITileMap'>
        <Form className="Map" data={data} onSubmit={setData}>
            <Button label="New" />
        </Form>
        <UITileMapDiagram diagram={TileMap.diagram} tileMap={tileMap} />
    </section>
}


function UITileMapDiagram({diagram, tileMap}) {
    const [diagramData, setDiagramData] = useState(diagram.schema.build())
    const [sceneData, setSceneData] = useState(TileMapScene.schema.build())

    const mapDiagram = diagram.create(tileMap, diagramData)

    const handleDrag = point => {
        setSceneData(sceneData.update('focus', Point.hash(point)))
    }
    const handleWheel = zoom => setSceneData(sceneData.update('zoom', zoom))
    const handleClick = point => console.info(tileMap.get(point))

    return <>
        <UITileMapScene
            diagram={mapDiagram}
            sceneData={sceneData}
            handleDrag={handleDrag}
            handleWheel={handleWheel}
            handleClick={handleClick}
        />
        <section className="UITileMapSidebar">
            <Text>Seed: {tileMap.seed}</Text>
            <Text>{tileMap.getDescription()}</Text>
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