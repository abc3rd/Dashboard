import Home from './pages/Home';
import PerformanceMonitoring from './pages/PerformanceMonitoring';
import RouterPacket from './pages/RouterPacket';
import UcpApiDocs from './pages/UcpApiDocs';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "PerformanceMonitoring": PerformanceMonitoring,
    "RouterPacket": RouterPacket,
    "UcpApiDocs": UcpApiDocs,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};