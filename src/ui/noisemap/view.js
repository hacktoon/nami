import React, { useState } from 'react'

import { SimplexNoise } from '/lib/noise'
import { Color } from '/lib/color'


const simplex = new SimplexNoise()


function getColor(noiseMap, point) {
    // const region = noiseMap.get(point)
    let {x, y} = point
    const scale = .01
    const height = simplex.noise(8, x, y, .6, scale, 0, 255)
    return new Color(height, height, height).toHex()
}
