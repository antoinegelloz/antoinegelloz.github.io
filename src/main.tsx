import React from 'react'
import {createRoot} from "react-dom/client";
import {ChakraProvider} from '@chakra-ui/react'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Root from './routes/root'
import AdDetails, {loader as adLoader} from "./routes/adDetails";
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

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root/>,
    },
    {
        path: "ads/:adId",
        loader: adLoader,
        element: <AdDetails/>,
    },
]);

createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <RouterProvider router={router}/>
        </ChakraProvider>
    </React.StrictMode>
)
