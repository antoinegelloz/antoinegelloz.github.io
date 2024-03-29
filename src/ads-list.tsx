import {useEffect, useState} from "react";
import {Ad} from "./models";
import {
    Card, CardBody, CardFooter, Image,
    Link, Skeleton,
    Stack, Table, TableCaption, TableContainer, Tag, Tbody,
    Td, Tr,
} from "@chakra-ui/react";
import {Link as ReactRouterlink} from "react-router-dom";
import {formatDiff, formatMoney} from "./format";
import {supabaseClient} from "./root";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import {} from "dayjs/locale/fr"

const useAdsAsync = (userId: string | undefined) => {
    const pageLen = 50
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
                        .eq('property_type', "Apartment")
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
                    .eq('property_type', "Apartment")
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

    dayjs.extend(relativeTime)
    dayjs.locale('fr')
    console.log("render ads list", JSON.parse(JSON.stringify(ads)))
    return (
        <>
            {ads.map((ad) => (
                <Link as={ReactRouterlink} to={"/ads/" + ad.id.toString()} isExternal={true}
                      variant='custom' key={ad.unique_id}>
                    <Card maxW='sm'>
                        <CardBody>
                            <Stack direction='row' overflowX='auto' mb={'20px'}>
                                {ad.raw.images_url && ad.raw.images_url.length > 0 ? ad.raw.images_url.map((imageURL) => (
                                    <Image boxSize='350px' objectFit='cover' key={imageURL} src={imageURL}
                                           fallback={<Skeleton height="350px" width="350px"/>}></Image>
                                )) : <Skeleton height="350px" width="350px"/>}
                            </Stack>
                            <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>{formatMoney(ad.price)}</Tag>
                            {ad.floor ?
                                <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>{ad.floor}</Tag> : <></>
                            }
                            <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                {ad.rooms > 1 ? ad.rooms + " pièces de " + ad.area + "m²" : ad.rooms + " pièce de " + ad.area + "m²"}
                            </Tag>
                            {ad.geojson && ad.geojson.features && ad.geojson.features.length > 0 ?
                                <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}
                                     textAlign={'center'}>{ad.geojson.features[0].properties.label}</Tag> : <></>
                            }
                            {ad.website != "" ?
                                <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>{ad.website}</Tag> : <></>
                            }
                        </CardBody>
                        <CardFooter>
                            <TableContainer width={'100%'}>
                                <Table variant='simple' size={'sm'}>
                                    <TableCaption>Ajoutée {dayjs(ad.inserted_at, undefined, 'fr', false).fromNow()}</TableCaption>
                                    <Tbody>
                                        <Tr>
                                            <Td>Prix</Td>
                                            <Td>{formatMoney(ad.price_sqm)}/m²</Td>
                                        </Tr>
                                        {ad.dvf.appt_price_sqm ?
                                            <Tr>
                                                <Td>Moyenne</Td>
                                                <Td>{formatMoney(ad.dvf.appt_price_sqm)}/m²</Td>
                                            </Tr> : <></>
                                        }
                                        {ad.dvf.appt_qty ?
                                            <Tr>
                                                <Td>Ventes</Td>
                                                <Td>{ad.dvf.appt_qty}</Td>
                                            </Tr> : <></>
                                        }
                                        {ad.dvf.appt_price_sqm ?
                                            <Tr>
                                                <Td>Différence</Td>
                                                <Td>{formatDiff((ad.price_sqm - ad.dvf.appt_price_sqm) / ad.dvf.appt_price_sqm * 100)}%</Td>
                                            </Tr> : <></>
                                        }
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
        </>
    )
}

export default AdsList
