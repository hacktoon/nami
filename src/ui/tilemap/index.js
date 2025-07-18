import { useState } from 'react'

import { Point } from '/src/lib/geometry/point'
import { Form } from '/src/ui/form'
import { Button } from '/src/ui/form/button'
import { Text } from '/src/ui'

import { TileMapScene, UITileMapScene } from './scene'


export function UITileMap({modelClass}) {
    const [data, setData] = useState(modelClass.schema.build())
    const tileMap = modelClass.create(data)

    return <section className='UITileMap'>
        <section className="UITileMapForm">
            <Form data={data} onSubmit={setData}>
                <Button label="New" />
            </Form>
        </section>
        <UITileMapDiagram
            diagram={modelClass.diagram}
            tileMap={tileMap}
        />
    </section>
}


function UITileMapDiagram({diagram, tileMap}) {
    const [diagramData, setDiagramData] = useState(diagram.schema.build())
    const [sceneData, setSceneData] = useState(TileMapScene.schema.build())
    const mapDiagram = diagram.create(tileMap, diagramData)
    const handleDrag = point => {
        const updatedFocus = sceneData.update('focus', Point.hash(point))
        setSceneData(updatedFocus)
    }
    const handleWheel = zoom => setSceneData(sceneData.update('zoom', zoom))
    const handleClick = point => console.info(tileMap.get(point))

    return <>
        <UITileMapScene
            diagram={mapDiagram}
            tileMap={tileMap}
            sceneData={sceneData}
            handleDrag={handleDrag}
            handleWheel={handleWheel}
            handleClick={handleClick}
        />
        <section className="UITileMapSidebar">
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

function UIBlockMap({tileMap}) {
    return <section>
        <Text>{tileMap.getDescription()}</Text>
    </section>
}