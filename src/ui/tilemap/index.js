import React, { useState } from 'react'

import { Point } from '/src/lib/point'
import { Form } from '/src/ui/form'
import { Button } from '/src/ui/form/button'
import { Text } from '/src/ui'
import { TileMapScene } from '/src/lib/model/tilemap/scene'

import { UITileMapScene } from './scene'


export function UITileMap({TileMap}) {
    const [data, setData] = useState(TileMap.schema.build())
    const tileMap = TileMap.create(data)
    const colorMap = new TileMap.diagram.colorMap(tileMap)

    return <section className='UITileMap'>
        <section className="UITileMapForm">
            <Form data={data} onSubmit={setData}>
                <Button label="New" />
            </Form>
        </section>
        <UITileMapDiagram
            diagram={TileMap.diagram}
            tileMap={tileMap}
            colorMap={colorMap}
        />
    </section>
}


function UITileMapDiagram({diagram, tileMap, colorMap}) {
    const [diagramData, setDiagramData] = useState(diagram.schema.build())
    const [sceneData, setSceneData] = useState(TileMapScene.schema.build())

    const mapDiagram = diagram.create(tileMap, colorMap, diagramData)

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