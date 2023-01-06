import React from 'react'
import {createRoot} from "react-dom/client";
import {ChakraProvider} from '@chakra-ui/react'
import {createBrowserRouter, RouterProvider, useRouteError} from "react-router-dom";
import Root from './root'
import AdDetails, {loader as adLoader} from "./ad-details";
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
        },
        Accordion: {
            variants: {
                'mutations': {
                    button: {
                        fontFamily: 'monospace',
                        fontSize: '9px',
                        whiteSpace: 'pre-wrap',
                    },
                    panel: {
                        fontFamily: 'monospace',
                        fontSize: '9px',
                        whiteSpace: 'pre-wrap',
                    }
                }
            }
        },
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
    // @ts-ignore
    let msg = error.message
    return (
        <>
            <div>{msg}</div>
            <div>{JSON.stringify(error, null, 4)}</div>
        </>
    )
}

createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <RouterProvider router={router}/>
        </ChakraProvider>
    </React.StrictMode>
)
