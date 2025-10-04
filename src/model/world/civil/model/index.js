import { Grid } from '/src/lib/grid'

import {
    buildCityMap,
    buildCityPoints,
    buildCitySpaces,
} from './city'


export function buildModel(context) {
    const cityPoints = buildCityPoints(context)
    const cityMap = buildCityMap({...context, cityPoints})
    // build a city grid with a city id per flood area
    // build a graph connecting neighbor cities by id using fill data
    const midpointIndexGrid = Grid.fromRect(context.rect, () => null)
    const citySpaces = buildCitySpaces({...context, midpointIndexGrid, cityPoints, cityMap})
    return {
        cityMap,
        cityPoints,
        midpointIndexGrid,
        cityGrid: citySpaces.cityGrid,
        routeMaskGrid: citySpaces.routeMaskGrid,
        wildernessGrid: citySpaces.wildernessGrid,
    }
}