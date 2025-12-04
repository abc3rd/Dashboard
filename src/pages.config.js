import Home from './pages/Home';
import RouterPacket from './pages/RouterPacket';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "RouterPacket": RouterPacket,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};