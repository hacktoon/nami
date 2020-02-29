import React, { useState } from 'react'

import { View } from './view'
import { ViewMenu } from './menu'
import { Component } from '/ui/lib'
import { Point } from '/lib/point'


const DEFAULT_TILE_SIZE = 10


export default function RegionsView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)

    return <Component className='RegionsView'>
        <ViewMenu
            onTilesizeChange={event => setTilesize(event.target.value)}
            world={props.world}
            tilesize={tilesize}
        />
    </Component>
}
