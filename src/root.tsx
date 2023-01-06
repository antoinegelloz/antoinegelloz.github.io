import {useEffect, useState} from 'react'
import {Link as ReactRouterlink} from "react-router-dom";
import {createClient, Session} from '@supabase/supabase-js'
import {
    Box, Image, Center, Text, SimpleGrid, Spinner, Link,
    Button, Alert, AlertIcon, AlertTitle, AlertDescription
} from "@chakra-ui/react";
import {formatDate, formatDiff, formatMoney} from "./format";
import {Ad} from "./models";
import Profile from "./profile";
import Auth from "./auth";

const supabaseUrl = "https://gwjpvyboxyqqmbmtoysx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3anB2eWJveHlxcW1ibXRveXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE4NzAwNTQsImV4cCI6MTk4NzQ0NjA1NH0.aG2bvulNBLI7SuVtutYgz4g22CtnWpL7xBRayApJiaE"
export const supabaseClient = createClient(supabaseUrl, supabaseKey)

function Root() {
    const [ads, setAds] = useState<Ad[]>([])
    const [error, setError] = useState<string | null>(null)
    const pageLen = 5
    const [session, setSession] = useState<Session | null>(null)
    const [minPrice, setMinPrice] = useState<Number>(0)
    const [maxPrice, setMaxPrice] = useState<Number>(0)
    const [postcodes, setPostcodes] = useState<String[]>([])

    const fetchMoreAds = async () => {
        const currIndex = ads.length
        const currAds = ads

        console.log('session before', session)
        const {data: sessionData, error: sessionError} = await supabaseClient.auth.getSession()
        if (sessionError) {
            console.log('fetchMoreAds getSession error', sessionError)
            setError('fetchMoreAds getSession: ' + JSON.stringify(sessionError))
            return
        }
        setSession(sessionData.session)
        console.log('session after', session)

        if (session) {
            let {
                data: profileData, error: profileError,
                status: profileStatus, statusText: profileStatusText
            } = await supabaseClient
                .from('profiles')
                .select(`min_price, max_price, postcodes`)
                .eq('id', session.user.id)
                .single()

            if (profileError) {
                console.log('fetchMoreAds fetch session error', profileError,
                    'status', profileStatus, 'statusText', profileStatusText)
                setError(JSON.stringify(profileError) +
                    " statusCode:" + profileStatus + " status:" + profileStatusText)
                return
            }

            if (!profileData) {
                console.log('fetchMoreAds empty profile session', session)
                setError(JSON.stringify(session.user))
                return
            }

            console.log('fetchMoreAds profileData', profileData)
            if (profileData.min_price < 0) {
                setMinPrice(0)
            } else {
                setMinPrice(profileData.min_price)
            }

            if (profileData.max_price <= 0) {
                setMaxPrice(1000000)
            } else {
                setMaxPrice(profileData.max_price)
            }

            if (!profileData.postcodes || profileData.postcodes.length === 0) {
                setPostcodes(['75001'])
            }

            const {data, error, status, statusText} = await supabaseClient
                .from('ads')
                .select("*").order("id", {ascending: false})
                .eq('active', true)
                .gte('price', minPrice)
                .lte('price', maxPrice)
                .in('postal_code', postcodes)
                .range(currIndex, currIndex + pageLen - 1)
            if (error) {
                console.log('fetchMoreAds with session error', error,
                    'status', status, 'statusText', statusText)
                setError(JSON.stringify(error) +
                    " statusCode:" + status + " status:" + statusText)
                return
            }
            let newAds: Ad[] = data
            setAds([...currAds, ...newAds])
            return
        }

        const {data, error, status, statusText} = await supabaseClient
            .from('ads')
            .select("*").order("id", {ascending: false})
            .eq('active', true)
            .range(currIndex, currIndex + pageLen - 1)
        if (error) {
            console.log('fetchMoreAds error', error,
                'status', status, 'statusText', statusText)
            setError(JSON.stringify(error) +
                " statusCode:" + status + " status:" + statusText)
            return
        }
        let newAds: Ad[] = data
        setAds([...currAds, ...newAds])
    };

    useEffect(() => {
        supabaseClient.auth.getSession().then(
            ({data: {session}}) => {
                setSession(session)
            })

        supabaseClient.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
            })
        fetchMoreAds().then(r =>
            console.log('fetchMoreAds done', r)
        )
    }, []);

    console.log("ads", JSON.parse(JSON.stringify(ads)))
    return (
        <Center padding={8}>
            <SimpleGrid columns={1} spacing={3}>
                {error ?
                    <Alert status='error'>
                        <AlertIcon/>
                        <AlertTitle>Erreur !</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert> : <></>
                }
                {!session ? <Auth/> : <Profile key={session.user.id} session={session}/>}
                {ads.map((ad) => (
                    <Link as={ReactRouterlink} to={"/ads/" + ad.id.toString()} isExternal={true}
                          variant='custom' key={ad.unique_id}>
                        <Box p="2" borderWidth="1px">
                            {ad.raw.images_url ?
                                <Image borderRadius="md" src={ad.raw.images_url[0]}
                                       fallback={<Spinner></Spinner>}/> :
                                <></>
                            }
                            <Text mt={3} fontSize="xl" fontWeight="bold" color="pink.800">
                                {formatMoney(ad.price)} &bull; {formatMoney(ad.price_sqm)}/m²
                            </Text>
                            <Text mt={0} fontSize="xl" fontWeight="bold" color="pink.800">
                                {ad.raw.rooms > 1 ? ad.raw.rooms + " pièces de " + ad.area + "m²" : ad.raw.rooms + " pièce de " + ad.area + "m²"}
                            </Text>
                            <Text mt={1} fontSize="md" fontWeight="bold" color="black">
                                {ad.geojson.features[0].properties.label}
                            </Text>
                            <Text mt={3} mb={2} fontSize="sm" lineHeight="short" color="dimgrey">
                                {formatMoney(ad.dvf.appt_price_sqm)}/m² ({ad.dvf.appt_qty} ventes)
                            </Text>
                            <Text mt={3} mb={2} fontSize="sm" lineHeight="short" color="dimgrey">
                                {formatDiff((ad.price_sqm - ad.dvf.appt_price_sqm) / ad.dvf.appt_price_sqm * 100)}%
                                ({formatMoney(ad.price_sqm - ad.dvf.appt_price_sqm)}/m²)
                            </Text>
                            <Text mt={3} mb={2} fontSize="sm" lineHeight="short" color="dimgrey">
                                {formatDate(Date.parse(ad.inserted_at))}
                            </Text>
                        </Box>
                    </Link>
                ))}
                <Button onClick={() => fetchMoreAds()}>
                    +
                </Button>
            </SimpleGrid>
        </Center>
    )
}

export default Root
