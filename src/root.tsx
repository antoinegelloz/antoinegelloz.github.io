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
    Link,
    Button
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
    active: boolean
    raw: RawAd
}

export type GeoJSON = {
    features: Feature[]
}

type DVF = {
    agg_mutations: AggMutations[]
}

type AggMutations = {
    id_mutation: string
    date_mutation: string
    valeur_fonciere: number
    price_per_square_lot: number
    price_per_square_srb: number
    distances_m: number[]
    sections: string[]
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

const supabaseUrl = "https://mffvjgbvtthawpkfqknk.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZnZqZ2J2dHRoYXdwa2Zxa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjQwNDgxNDEsImV4cCI6MTk3OTYyNDE0MX0.DaP5FawarSaGWrxPzIQ6qqEp7kObOOV8B8IxD_J8Z_Q"
export const supabaseClient = createClient(supabaseUrl, supabaseKey)

export const formatDate = (date: number) => new Intl.DateTimeFormat(
    'fr-FR',
    {dateStyle: 'medium', timeStyle: 'short'},
).format(date);

export const formatDateShort = (date: number) => new Intl.DateTimeFormat(
    'fr-FR',
    {dateStyle: 'short'},
).format(date);

export const formatMoney = (amount: number) => new Intl.NumberFormat(
    'fr-FR',
    {style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0},
).format(amount);

function Root() {
    const [ads, setAds] = useState<Ad[]>([])
    const [numAds, setNumAds] = useState<number | null>(null)
    const [error, setError] = useState<PostgrestError | null>(null)
    const pageLen = 5

    const fetchNumAds = async () => {
        const {count, error} = await supabaseClient.from("ads")
            .select("*", {count: 'exact', head: true})
            .eq('active', true)
        if (error) {
            console.log('fetchNumAds error', error)
            setError(error)
            return
        }

        setNumAds(count)
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
                <Center padding={1}>
                    <Text fontSize="sm">{numAds} annonces</Text>
                </Center>
                {ads.map((ad) => (
                    <Link as={ReactRouterlink} to={"/ads/" + ad.id.toString()} isExternal={true}
                          variant='custom' key={ad.unique_id}>
                        <Box p="3" maxW="360px" borderWidth="1px">
                            {ad.raw.images_url ?
                                <Image borderRadius="md" src={ad.raw.images_url[0]} fallback={<Spinner></Spinner>}/> :
                                <></>
                            }
                            <Text mt={3} fontSize="xl" fontWeight="bold" color="pink.800">
                                {formatMoney(ad.price)} &bull; {formatMoney(ad.price_per_sqm)}/m²
                            </Text>
                            <Text mt={0} fontSize="xl" fontWeight="bold" color="pink.800">
                                {ad.raw.rooms > 1 ? ad.raw.rooms + " pièces de " + ad.area + "m²" : ad.raw.rooms + " pièce de " + ad.area + "m²"}
                            </Text>
                            <Text mt={1} fontSize="md" fontWeight="bold" color="black">
                                {ad.geojson.features[0].properties.label}
                            </Text>
                            {ad.score > 0 ?
                                <Stat mt={3}>
                                    <StatLabel color="dimgrey">Score</StatLabel>
                                    <StatNumber>{ad.score}</StatNumber>
                                    {ad.dvf.agg_mutations ?
                                        <StatHelpText
                                            color="dimgrey">{ad.dvf.agg_mutations.length} mutations</StatHelpText> :
                                        <></>
                                    }
                                </Stat> : <></>
                            }
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
