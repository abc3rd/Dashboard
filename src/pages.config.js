import { lazy } from 'react';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


// Home is the entry page and stays in the initial bundle; every other page is
// split into its own chunk so the first load stays small.
export const PAGES = {
    "Home": Home,
    "PerformanceMonitoring": lazy(() => import('./pages/PerformanceMonitoring')),
    "RouterPacket": lazy(() => import('./pages/RouterPacket')),
    "UcpApiDocs": lazy(() => import('./pages/UcpApiDocs')),
    "About": lazy(() => import('./pages/About')),
    "Contact": lazy(() => import('./pages/Contact')),
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};