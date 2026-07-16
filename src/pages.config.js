import Home from './pages/Home';
import PerformanceMonitoring from './pages/PerformanceMonitoring';
import RouterPacket from './pages/RouterPacket';
import UcpApiDocs from './pages/UcpApiDocs';
import About from './pages/About';
import Contact from './pages/Contact';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "PerformanceMonitoring": PerformanceMonitoring,
    "RouterPacket": RouterPacket,
    "UcpApiDocs": UcpApiDocs,
    "About": About,
    "Contact": Contact,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};