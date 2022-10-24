import React from 'react'
import {createRoot} from "react-dom/client";
import {ChakraProvider} from '@chakra-ui/react'
import {createBrowserRouter, RouterProvider, useRouteError} from "react-router-dom";
import Root from './root'
import AdDetails, {loader as adLoader} from "./adDetails";
import {extendTheme} from "@chakra-ui/react"
import {accordionTheme} from "./components/accordion";

const theme = extendTheme({
    components: {
        Link: {
            variants: {
                'custom': {
                    ":hover": {textDecoration: 'none'},
                    ":visited": {textDecoration: 'none'},
                },
            }
        },
        Accordion: accordionTheme,
    }
})

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root/>,
        errorElement: <ErrorBoundary/>,
    },
    {
        path: "ads/:adId",
        loader: adLoader,
        element: <AdDetails/>,
        errorElement: <ErrorBoundary/>,
    },
]);

function ErrorBoundary() {
    let error = useRouteError();
    console.error(error);
    // Uncaught ReferenceError: path is not defined
    return <div>Dang!</div>;
}

createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <RouterProvider router={router}/>
        </ChakraProvider>
    </React.StrictMode>
)
