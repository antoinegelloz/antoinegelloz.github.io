import {useEffect, useState} from "react";
import {Ad} from "./models";
import {Session} from "@supabase/supabase-js";
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box, Button,
    Image,
    Link,
    Spinner, Text
} from "@chakra-ui/react";
import {Link as ReactRouterlink} from "react-router-dom";
import {formatDate, formatDiff, formatMoney} from "./format";
import {supabaseClient} from "./root";
import Auth from "./auth";
import Profile from "./profile";

function AdsList(props: { session: Session | null }) {
    const pageLen = 5
    const [ads, setAds] = useState<Ad[]>([])
    const [error, setError] = useState<string | null>(null)
    const [minPrice, setMinPrice] = useState<Number>(0)
    const [maxPrice, setMaxPrice] = useState<Number>(0)
    const [postcodes, setPostcodes] = useState<String[]>([])

    const fetchMoreAds = async () => {
        const currIndex = ads.length
        const currAds = ads

        console.log('fetchMoreAds session', props.session)

        if (props.session) {
            const {
                data: profileData, error: profileError,
                status: profileStatus, statusText: profileStatusText
            } = await supabaseClient
                .from('profiles')
                .select(`min_price, max_price, postcodes`)
                .eq('id', props.session.user.id)
                .single()

            if (profileError) {
                console.log('fetchMoreAds fetch session error', profileError,
                    'status', profileStatus, 'statusText', profileStatusText)
                setError(JSON.stringify(profileError) +
                    " statusCode:" + profileStatus + " status:" + profileStatusText)
                return
            }

            if (!profileData) {
                console.log('fetchMoreAds empty profile session', props.session)
                setError(JSON.stringify(props.session.user))
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
            const newAds: Ad[] = data
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
        const newAds: Ad[] = data
        setAds([...currAds, ...newAds])
    };

    useEffect(() => {
        fetchMoreAds().then(r =>
            console.log('fetchMoreAds done', r)
        )
    }, []);

    if (error) {
        alert(error)
    }

    console.log("render ads list", JSON.parse(JSON.stringify(ads)))
    return (
        <>
            {error ?
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
                        Erreur !
                    </AlertTitle>
                    <AlertDescription maxWidth='sm'>
                        {error}
                    </AlertDescription>
                </Alert> : <></>
            }
            {!props.session ? <Auth/> : <Profile key={props.session.user.id} session={props.session}/>}
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
        </>
    )
}

export default AdsList
