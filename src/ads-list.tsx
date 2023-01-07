import {useEffect, useState} from "react";
import {Ad} from "./models";
import {Box, Image, Link, Spinner, Text} from "@chakra-ui/react";
import {Link as ReactRouterlink} from "react-router-dom";
import {formatDate, formatDiff, formatMoney} from "./format";
import {supabaseClient} from "./root";

const useAdsAsync = (userId: string | undefined) => {
    const pageLen = 20
    const [ads, setAds] = useState<Ad[]>([]);

    useEffect(() => {
        async function fetchAds() {
            try {
                console.log('fetchAds userId', userId)
                if (userId) {
                    const {
                        data: profileData, error: profileError,
                        status: profileStatus, statusText: profileStatusText
                    } = await supabaseClient
                        .from('profiles')
                        .select(`min_price, max_price, postcodes`)
                        .eq('id', userId)
                        .single()
                    if (profileError) {
                        throw new Error(
                            `fetchAds fetch session error: profileError ${profileError} status: ${profileStatus} statusText: ${profileStatusText}`)
                    }

                    if (!profileData) {
                        throw new Error(
                            `fetchAds empty profile for userId: ${userId}`)
                    }

                    console.log('fetchAds profileData', profileData)
                    let minPrice: number = 0
                    let maxPrice: number = 1000000
                    let postcodes: string[] = ['75001']

                    if (profileData.min_price > 0) {
                        minPrice = profileData.min_price
                    }

                    if (profileData.max_price > 0) {
                        maxPrice = profileData.max_price
                    }

                    if (profileData.postcodes && profileData.postcodes.length > 0) {
                        postcodes = profileData.postcodes
                    }

                    console.log('fetchAds minPrice', minPrice, 'maxPrice', maxPrice, 'postcodes', postcodes)
                    const {data, error, status, statusText} = await supabaseClient
                        .from('ads')
                        .select("*")
                        .eq('active', true)
                        .gte('price', minPrice)
                        .lte('price', maxPrice)
                        .in('postal_code', postcodes)
                        .order("id", {ascending: false})
                        .limit(pageLen)
                    if (error) {
                        throw new Error(
                            `fetchAds with userId error: ${error} status: ${status} statusText: ${statusText}`)
                    }
                    setAds(data)
                    return
                }

                const {data, error, status, statusText} = await supabaseClient
                    .from('ads')
                    .select("*")
                    .eq('active', true)
                    .order("id", {ascending: false})
                    .limit(pageLen)
                if (error) {
                    throw new Error(
                        `fetchAds error: ${error} status: ${status} statusText: ${statusText}`)
                }
                setAds(data)
                return
            } catch (err) {
                console.error(err)
            }
        }

        fetchAds().then(r => console.info('fetchAds done'))
    }, [userId]);

    return ads;
};

function AdsList(props: { userId: string | undefined }) {
    const ads = useAdsAsync(props.userId)

    console.log("render ads list", JSON.parse(JSON.stringify(ads)))
    return (
        <>
            {ads.map((ad) => (
                <Link as={ReactRouterlink} to={"/ads/" + ad.id.toString()} isExternal={true}
                      variant='custom' key={ad.unique_id}>
                    <Box p="2" borderWidth="1px">
                        {ad.raw.images_url && ad.raw.images_url.length > 0 ?
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
                        {ad.geojson && ad.geojson.features && ad.geojson.features.length > 0 ?
                            <Text mt={1} fontSize="md" fontWeight="bold" color="black">
                                {ad.geojson.features[0].properties.label}
                            </Text> : <></>
                        }

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
        </>
    )
}

export default AdsList
