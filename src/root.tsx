import {useEffect, useState} from 'react'
import {createClient, Session} from '@supabase/supabase-js'
import {Center, SimpleGrid} from "@chakra-ui/react";
import Profile from "./profile";
import Auth from "./auth";
import AdsList from "./ads-list";

const supabaseUrl = "https://gwjpvyboxyqqmbmtoysx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3anB2eWJveHlxcW1ibXRveXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE4NzAwNTQsImV4cCI6MTk4NzQ0NjA1NH0.aG2bvulNBLI7SuVtutYgz4g22CtnWpL7xBRayApJiaE"
export const supabaseClient = createClient(supabaseUrl, supabaseKey)

function Root() {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabaseClient.auth.getSession().then(
            ({data: {session}}) => {
                setSession(session)
                console.log('useEffect session', session)
            })

        supabaseClient.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
            })
    }, []);

    return (
        <Center padding={8}>
            <SimpleGrid columns={1} spacing={3}>
                {!session ? <Auth/> : <Profile key={session.user.id} session={session}/>}
                <AdsList session={session}/>
            </SimpleGrid>
        </Center>
    )
}

export default Root
