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
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Link
} from "@chakra-ui/react";

export type Ad = {
    id: number
    unique_id: number
    inserted_at: string
    area: number
    price: number
    price_per_sqm: number
    geojson: GeoJSON
    dvf: DVF
    score: number
    raw: RawAd
}

type GeoJSON = {
    features: Feature[]
}

type DVF = {
    agg_mutations: any[]
}

type Feature = {
    properties: Properties
}

type Properties = {
    label: string
}

type RawAd = {
    title: string
    rooms: number
    images_url: string[]
}

const supabaseUrl = "https://mffvjgbvtthawpkfqknk.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZnZqZ2J2dHRoYXdwa2Zxa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjQwNDgxNDEsImV4cCI6MTk3OTYyNDE0MX0.DaP5FawarSaGWrxPzIQ6qqEp7kObOOV8B8IxD_J8Z_Q"
export const supabaseClient = createClient(supabaseUrl, supabaseKey)

export const formatDate = (date: number) => new Intl.DateTimeFormat(
    'fr-FR',
    {dateStyle: 'medium', timeStyle: 'short'},
).format(date);

export const formatMoney = (amount: number) => new Intl.NumberFormat(
    'fr-FR',
    {style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0},
).format(amount);

function Root() {
    const [ads, setAds] = useState<Ad[]>([])
    const [numAds, setNumAds] = useState<number | null>(null)
    const [error, setError] = useState<PostgrestError | null>(null)

    const getNumAds = async () => {
        const {count, error} = await supabaseClient.from("ads")
            .select("*", {count: 'exact', head: true})
            .eq('active', true)
        if (error) {
            console.log(error)
            setError(error)
            return
        }
        setNumAds(count)
    };

    const getAds = async () => {
        const {data, error} = await supabaseClient.from("ads")
            .select("*").order("id", {ascending: false})
            .range(0, 9).eq('active', true)
        if (error) {
            console.log(error)
            setError(error)
            return
        }
        setAds(data)
    };

    useEffect(() => {
        getNumAds()
        getAds()
    }, []);

    return (
        <Center padding={8}>
            <SimpleGrid columns={1} spacing={3}>
                {error ?
                    <Center padding={1}>
                        <Text fontSize="sm">{JSON.stringify(error, null, 4)}</Text>
                    </Center> : <></>
                }
                <Center padding={1}>
                    <Text fontSize="sm">{numAds} annonces</Text>
                </Center>
                {ads.map((ad) => (
                    <Link as={ReactRouterlink} to={"/ads/" + ad.id.toString()} isExternal={true}
                          variant='custom' key={ad.unique_id}>
                        <Box p="5" maxW="360px" borderWidth="1px">
                            <Image borderRadius="md" src={ad.raw.images_url[0]} fallback={<Spinner></Spinner>}/>
                            <Text mt={3} fontSize="sm" fontWeight="bold" color="pink.800">
                                {ad.raw.rooms > 1 ? ad.raw.rooms + " pièces de " + ad.area + "m²" : ad.raw.rooms + " pièce de " + ad.area + "m²"} &bull; {formatMoney(ad.price)}
                            </Text>
                            <Text mt={1} fontSize="sm" fontWeight="bold" color="pink.800">
                                {formatMoney(ad.price_per_sqm)}/m² &bull; {ad.geojson.features[0].properties.label}
                            </Text>
                            <Text mt={2} fontSize="xl" fontWeight="semibold" lineHeight="short">
                                {ad.raw.title}
                            </Text>
                            <Text mt={2} mb={2} fontSize="sm" lineHeight="short">
                                {formatDate(Date.parse(ad.inserted_at))}
                            </Text>
                            {ad.score > 0 ?
                                <Stat>
                                    <StatLabel>Score</StatLabel>
                                    <StatNumber>{ad.score}</StatNumber>
                                    <StatHelpText>{ad.dvf.agg_mutations.length} mutations</StatHelpText>
                                </Stat> : <></>
                            }
                        </Box>
                    </Link>
                ))}
            </SimpleGrid>
        </Center>
    )
}

export default Root
