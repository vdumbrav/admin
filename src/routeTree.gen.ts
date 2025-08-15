/* eslint-disable */
// @ts-nocheck
import { Route as rootRouteImport } from './routes/__root'
import { Route as questsRouteImport } from './routes/quests'

export const routeTree = rootRouteImport.addChildren([questsRouteImport])
