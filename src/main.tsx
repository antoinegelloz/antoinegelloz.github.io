import React from 'react'
import {createRoot} from "react-dom/client";
import {
    Alert, AlertDescription, AlertIcon,
    AlertTitle, ChakraProvider, Code
} from '@chakra-ui/react'
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
    return (
        <Alert
            status='error'
            variant='subtle'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            textAlign='center'
            height='200px'
        >
            <AlertIcon boxSize='40px' mr={0}/>
            <AlertTitle mt={4} mb={1} fontSize='lg'>
                Erreur
            </AlertTitle>
            <AlertDescription maxWidth='sm'>
                <Code>{JSON.stringify(error, null, 2)}</Code>
            </AlertDescription>
        </Alert>
    )
}

createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <RouterProvider router={router}/>
        </ChakraProvider>
    </React.StrictMode>
)
