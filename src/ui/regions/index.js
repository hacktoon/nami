import React, { useState } from 'react'

import { Component } from '/ui/lib'
import RegionsMenu from './menu'
import RegionsView from './view'

import "./index.css"


export default function RegionsApp(props) {
    return <Component className='RegionsApp'>
        <RegionsMenu />
        <RegionsView />
    </Component>
}