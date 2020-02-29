import React, { useState } from 'react'

import { Component } from '/ui/lib'
import Config from './config'
import View from './view'

import "./index.css"


export default function RegionsApp(props) {
    const onConfigChange = config => console.log(config)

    return <Component className='RegionsApp'>
        <Config onChange={onConfigChange} />
        <View />
    </Component>
}