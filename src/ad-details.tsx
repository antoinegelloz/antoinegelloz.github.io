import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Button, Card,
    CardBody,
    CardHeader,
    Center,
    Code,
    Heading,
    Image,
    ListItem,
    SimpleGrid, Skeleton,
    Stack, StackDivider, Tag,
    Text,
    UnorderedList
} from "@chakra-ui/react";
import {useLoaderData} from "react-router-dom";
import {supabaseClient} from "./root";
import {Ad} from "./models";
import {formatDateShort, formatDiff, formatMoney, formatMoneyDiff} from "./format";
import {Link, Box} from "@chakra-ui/react"
import Address from "./address";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {} from "dayjs/locale/fr"

export async function loader(props: any) {
    const {data, error} = await supabaseClient.from("ads")
        .select("*").eq('id', props.params.adId)
    if (error) {
        console.log('adDetails loader', error)
        throw new Response(error.message, {
            status: 404,
            statusText: "Not Found",
        });
    }

    return data;
}

function AdDetails() {
    let anyAd: any = useLoaderData()
    let adArray: Ad[] = anyAd
    if (adArray.length != 1) {
        return <Code>Error: {JSON.stringify(adArray, null, 4)}</Code>
    }
    let ad: Ad = adArray[0]
    console.log(ad, typeof ad)

    const sentences = ad.description.split(/\n|\. /)

    dayjs.extend(relativeTime)
    return (
        <Center padding={6}>
            <SimpleGrid columns={1} spacing={3}>
                <Button onClick={() => close()}>
                    &#x276E; Retour
                </Button>
                <Card mb='10px'>
                    <CardHeader>
                        <Link href={ad.raw.url} isExternal={true}
                              variant='custom'>
                            <Heading>{ad.raw.title}</Heading>
                        </Link>
                    </CardHeader>
                    <CardBody>
                        <Stack divider={<StackDivider/>} spacing='4'>
                            <Box>
                                {sentences.map((s, i) => {
                                    if (s.length <= 2) {
                                        return <></>
                                    }
                                    return (
                                        <Text key={i}>
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </Text>
                                    )
                                })}
                            </Box>
                            <Box>
                                {ad.geojson && ad.geojson.features && ad.geojson.features.length > 0 ?
                                    <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                        <Link
                                            href={encodeURI("https://www.google.com/maps/search/?api=1&query=" + ad.geojson.features[0].properties.label)}
                                            variant='custom'
                                            isExternal>
                                            {ad.geojson.features[0].properties.label}
                                        </Link>
                                    </Tag> : <></>
                                }
                                {ad.guessed_address != "" ?
                                    <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                        Suggestion: {ad.guessed_address}
                                    </Tag> : <></>
                                }
                                <Address adID={ad.id}/>
                                <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                    {ad.rooms > 1 ? ad.rooms + " pièces de " + ad.area + "m²" : ad.rooms + " pièce de " + ad.area + "m²"}
                                </Tag>
                                <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                    {formatMoney(ad.price)}
                                </Tag>
                                {ad.rooms > 1 ?
                                    <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                        {ad.rooms} pièces de {ad.area}m²
                                    </Tag> :
                                    <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                        {ad.rooms} pièce de {ad.area}m²
                                    </Tag>
                                }
                                <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                    {formatMoney(ad.price_sqm)}/m²
                                </Tag>
                                {ad.floor ?
                                    <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                        Étage de l'annonce : {ad.floor}
                                    </Tag> : <></>
                                }
                                {ad.guessed_floor != "" ?
                                    <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                        Étage probable : {ad.guessed_floor}
                                    </Tag> : <></>
                                }
                                <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                    Ajoutée {dayjs(ad.inserted_at).locale('fr').fromNow()}
                                </Tag>
                                <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                    Mise à jour {dayjs(ad.updated_at).locale('fr').fromNow()}
                                </Tag>
                                <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                    Annonce {ad.active ? "active" : "inactive"}
                                </Tag>
                            </Box>
                            <Stack direction='row' overflowX='auto'>
                                {ad.raw.images_url && ad.raw.images_url.length > 0 ? ad.raw.images_url.map((imageURL) => (
                                    <Image boxSize='350px' objectFit='contain' key={imageURL} src={imageURL}
                                           fallback={<Skeleton height="350px" width="350px"/>}></Image>
                                )) : <Skeleton height="350px" width="350px"/>}
                            </Stack>
                            <Box>
                                <Heading size='md' textTransform='uppercase' mb={'10px'}>
                                    DVF
                                </Heading>
                                {ad.dvf.appt_price_sqm > 0 ?
                                    <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                        Moyenne : {formatMoney(ad.dvf.appt_price_sqm)}/m² ({ad.dvf.appt_qty} ventes)
                                    </Tag> : <></>
                                }
                                {ad.dvf.appt_price_sqm > 0 ?
                                    <Tag fontSize={'18px'} pt={'5px'} pb={'5px'} m={'2px'}>
                                        Différence
                                        : {formatDiff((ad.price_sqm - ad.dvf.appt_price_sqm) / ad.dvf.appt_price_sqm * 100)}%
                                        ({formatMoneyDiff(ad.price_sqm - ad.dvf.appt_price_sqm)}/m²)
                                    </Tag> : <></>
                                }
                            </Box>
                        </Stack>
                    </CardBody>
                </Card>


                {ad.dvf.mutations_agg ?
                    <Accordion variant='mutations' allowMultiple>
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex='1' textAlign='left'>
                                        {'Date    Distance   Prix       Lot       SRB'}
                                    </Box>
                                    <AccordionIcon/>
                                </AccordionButton>
                            </h2>
                        </AccordionItem>
                        {ad.dvf.mutations_agg.map((m, i) => {
                            let date = Date.parse(m.date_mutation)
                            let distances = '';
                            m.distances_m.forEach((d) => {
                                if (distances != '') {
                                    distances += ' ';
                                }
                                distances += d.toString();
                            });

                            return (
                                <AccordionItem key={i}>
                                    <h2>
                                        <AccordionButton>
                                            <Box flex='1' textAlign='left'>
                                                {formatDateShort(date).slice(3) + ' ' +
                                                    distances.replace(' ', '/').padStart(3) + 'm ' +
                                                    formatMoney(m.valeur_fonciere).padStart(12) +
                                                    formatMoney(m.price_sqm_lot).padStart(10) +
                                                    formatMoney(m.price_sqm_srb).padStart(10)}
                                            </Box>
                                            <AccordionIcon/>
                                        </AccordionButton>
                                        <AccordionPanel pb={4}>
                                            {JSON.stringify(m, null, 1)}
                                        </AccordionPanel>
                                    </h2>
                                </AccordionItem>
                            )
                        })}
                    </Accordion> : <></>
                }
            </SimpleGrid>
        </Center>
    )
}

export default AdDetails
