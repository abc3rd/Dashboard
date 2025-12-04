import Home from './pages/Home';
import RouterPacket from './pages/RouterPacket';
import UcpApiDocs from './pages/UcpApiDocs';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "RouterPacket": RouterPacket,
    "UcpApiDocs": UcpApiDocs,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};