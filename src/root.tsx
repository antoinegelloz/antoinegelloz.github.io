import {useEffect, useState} from 'react'
import {createClient, Session} from '@supabase/supabase-js'
import {Button, Center, Link, SimpleGrid} from "@chakra-ui/react";
import AdsList from "./ads-list";
import Auth from "./auth";
import Profile from "./profile";
import {Link as ReactRouterlink} from "react-router-dom";

const supabaseUrl = "https://gwjpvyboxyqqmbmtoysx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3anB2eWJveHlxcW1ibXRveXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE4NzAwNTQsImV4cCI6MTk4NzQ0NjA1NH0.aG2bvulNBLI7SuVtutYgz4g22CtnWpL7xBRayApJiaE"
export const supabaseClient = createClient(supabaseUrl, supabaseKey)

function Root() {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabaseClient.auth.getSession().then(
            ({data: {session}}) => {
                console.log('useEffect getSession', session)
                setSession(session)
            })

        supabaseClient.auth.onAuthStateChange(
            (_event, session) => {
                console.log('useEffect onAuthStateChange', session)
                setSession(session)
            })
    }, []);

    console.log('render root', session)
    return (
        <Center padding={6}>
            <SimpleGrid columns={1} spacing={3}>
                {!session ? <Auth/> : <Profile key={session.user.id} session={session}/>}
                <Link as={ReactRouterlink} to={"/ads/new"} isExternal={true}>
                    <Button>Nouvelle annonce</Button>
                </Link>
                <AdsList userId={session?.user.id}/>
            </SimpleGrid>
        </Center>
    )
}

export default Root
