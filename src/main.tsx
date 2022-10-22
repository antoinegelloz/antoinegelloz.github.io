import React from 'react'
import {createRoot} from "react-dom/client";
import {ChakraProvider} from '@chakra-ui/react'
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route,
} from "react-router-dom";
import App from './App'
import AdDetails, {
    loader as adLoader,
} from "./AdDetails";
import ErrorPage from "./errorPage";
import {extendTheme} from "@chakra-ui/react"

const theme = extendTheme({
    components: {
        Link: {
            variants: {
                'custom': {
                    ":hover": {textDecoration: 'none'},
                    ":visited": {textDecoration: 'none'},
                },
            }
        }
    }
})

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<App/>} errorElement={<ErrorPage/>}/>
            <Route path="ads/:adId" element={<AdDetails/>} loader={adLoader} errorElement={<ErrorPage/>}/>
        </>
    )
);

createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <RouterProvider router={router}/>
        </ChakraProvider>
    </React.StrictMode>
)
