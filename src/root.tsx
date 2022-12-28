import {useEffect, useState} from 'react'
import {Link as ReactRouterlink} from "react-router-dom";
import {createClient, PostgrestError} from '@supabase/supabase-js'
import {
    Box,
    Image,
    Center,
    Text,
    SimpleGrid,
    Spinner,
    Link,
    Button
} from "@chakra-ui/react";

export type Ad = {
    id: number
    unique_id: number
    inserted_at: string
    updated_at: string
    area: number
    price: number
    price_sqm: number
    geojson: GeoJSON
    dvf: DVF
    active: boolean
    raw: RawAd
}

export type GeoJSON = {
    features: Feature[]
}

type DVF = {
    radius_meter: number
    appt_qty: number
    appt_price_sqm: number
    mutations_agg: AggMutations[]
}

type AggMutations = {
    id_mutation: string
    date_mutation: string
    valeur_fonciere: number
    price_sqm_lot: number
    price_sqm_srb: number
    distances_m: number[]
    id_parcelles: string[]
}

type Feature = {
    properties: Properties
}

type Properties = {
    label: string
    type: string
    score: number
}

type RawAd = {
    title: string
    description: string
    url: string
    rooms: number
    images_url: string[]
}

const supabaseUrl = "https://gwjpvyboxyqqmbmtoysx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3anB2eWJveHlxcW1ibXRveXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE4NzAwNTQsImV4cCI6MTk4NzQ0NjA1NH0.aG2bvulNBLI7SuVtutYgz4g22CtnWpL7xBRayApJiaE"
export const supabaseClient = createClient(supabaseUrl, supabaseKey)

export const formatDate = (date: number) => new Intl.DateTimeFormat(
    'fr-FR', {dateStyle: 'medium', timeStyle: 'short'},
).format(date);

export const formatDateShort = (date: number) => new Intl.DateTimeFormat(
    'fr-FR', {dateStyle: 'short'},
).format(date);

export const formatMoney = (amount: number) => new Intl.NumberFormat(
    'fr-FR',
    {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    },
).format(amount);

export const formatDiff = (amount: number) => {
    if (amount > 0) {
        return "+" + amount.toFixed(0)
    }

    return amount.toFixed(0)
}

function Root() {
    const [ads, setAds] = useState<Ad[]>([])
    const [numAds, setNumAds] = useState<number | null>(null)
    const [error, setError] = useState<PostgrestError | string | null>(null)
    const [numAdsLoading, setNumAdsLoading] = useState(false)
    const pageLen = 5

    const fetchNumAds = async () => {
        try {
            setNumAdsLoading(true)
            const {count, error} = await supabaseClient
                .from("ads")
                .select("*", {head: true, count: "estimated"})
                .eq('active', true)
            if (error) {
                setError(error)
                throw error
            } else {
                console.log('count', count)
                setNumAds(count)
            }
        } catch (e) {
            console.log('fetchNumAds error', e)
            console.log('fetchNumAds error type', typeof e)
            setError(JSON.stringify(e))
        } finally {
            setNumAdsLoading(false)
        }
    };

    const fetchMoreAds = async () => {
        const currIndex = ads.length
        const currAds = ads
        const {data, error} = await supabaseClient
            .from('ads')
            .select("*").order("id", {ascending: false})
            .range(currIndex, currIndex + pageLen - 1)
            .eq('active', true);
        if (error) {
            console.log('fetchMoreAds error', error);
            setError(error)
            return
        }
        let newAds: Ad[] = data
        setAds([...currAds, ...newAds]);
    };

    useEffect(() => {
        fetchMoreAds()
        fetchNumAds()
    }, []);

    console.log("ads", JSON.parse(JSON.stringify(ads)))
    return (
        <Center padding={8}>
            <SimpleGrid columns={1} spacing={3}>
                {error ?
                    <Center padding={1}>
                        <Text fontSize="sm">{JSON.stringify(error, null, 4)}</Text>
                    </Center> : <></>
                }
                {numAdsLoading ? <Spinner></Spinner> :
                    <Center padding={1}>
                        <Text fontSize="sm">{numAds} annonces</Text>
                    </Center>
                }
                {ads.map((ad) => (
                    <Link as={ReactRouterlink} to={"/ads/" + ad.id.toString()} isExternal={true}
                          variant='custom' key={ad.unique_id}>
                        <Box p="3" maxW="360px" borderWidth="1px">
                            {ad.raw.images_url ?
                                <Image borderRadius="md" src={ad.raw.images_url[0]} fallback={<Spinner></Spinner>}/> :
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
