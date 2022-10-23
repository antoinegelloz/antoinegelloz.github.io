import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Button,
    Center,
    Code, Flex,
    Heading,
    Image,
    ListItem,
    SimpleGrid,
    Spacer,
    Spinner,
    Text,
    UnorderedList
} from "@chakra-ui/react";
import {useLoaderData} from "react-router-dom";
import {Ad, formatDate, formatDateShort, formatMoney, supabaseClient} from "./root";
import {Link, Box} from "@chakra-ui/react"
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";
import Address from "./address";

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
        return <Code>Error:{JSON.stringify(adArray, null, 4)}</Code>
    }
    let ad: Ad = adArray[0]
    console.log(ad, typeof ad)

    const sentences = ad.raw.description.split(/\n|\. /)

    return (
        <Center padding={8}>
            <SimpleGrid columns={1} spacing={3}>
                <Button onClick={() => close()}>
                    &#x276E; Retour
                </Button>
                <Link href={ad.raw.url} isExternal={true}
                      variant='custom'>
                    <Heading>{ad.raw.title}</Heading>
                </Link>
                <Heading color="darkgray" mt={5}>Description</Heading>
                {sentences.map((s) => {
                    if (s.length <= 2) {
                        return <></>
                    }
                    return (
                        <Text key={uuid()}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Text>
                    )
                })}
                <br/>
                {ad.raw.images_url.map((imageURL) => (
                    <Image key={uuid()} src={imageURL} fallback={<Spinner></Spinner>}></Image>
                ))}
                <Heading color="darkgray" mt={5}>Statistiques</Heading>
                <UnorderedList>
                    <ListItem>
                        <Link
                            href={encodeURI("https://www.google.com/maps/search/?api=1&query=" + ad.geojson.features[0].properties.label)}
                            isExternal={true}
                            variant='custom'>
                            {ad.geojson.features[0].properties.label}
                        </Link>
                    </ListItem>
                    <ListItem>{formatMoney(ad.price)}</ListItem>
                    {ad.raw.rooms > 1 ?
                        <ListItem>{ad.raw.rooms} pièces de {ad.area}m²</ListItem> :
                        <ListItem>{ad.raw.rooms} pièce de {ad.area}m²</ListItem>
                    }
                    <ListItem>{formatMoney(ad.price_per_sqm)}/m²</ListItem>
                    <ListItem>Mise en ligne : {formatDate(Date.parse(ad.inserted_at))}</ListItem>
                    <ListItem>Statut : {ad.active ? "active" : "inactive"}</ListItem>
                    <ListItem>Score : {ad.score}</ListItem>
                </UnorderedList>
                <Address/>
                {ad.dvf.agg_mutations ?
                    <>
                        <Heading color="darkgrey" mt={5}>Mutations DVF</Heading>
                        <Accordion allowMultiple>
                            <AccordionItem>
                                <Flex>
                                    <Box p='3'>Date</Box>
                                    <Spacer/>
                                    <Box p='3'>Distance</Box>
                                    <Spacer/>
                                    <Box p='3'>Prix</Box>
                                    <Spacer/>
                                    <Box p='3'>Lot</Box>
                                    <Spacer/>
                                    <Box p='3'>SRB</Box>
                                    <Spacer/>
                                    <Box p='3'><AccordionIcon/></Box>
                                </Flex>
                            </AccordionItem>
                            {ad.dvf.agg_mutations.map((m) => {
                                let date = Date.parse(m.date_mutation)
                                let distances = '';
                                m.distances_m.forEach((d) => {
                                    if (distances != '') {
                                        distances += ' ';
                                    }
                                    distances += d.toString();
                                });

                                return <AccordionItem key={uuid()}>
                                    <Flex>
                                        <AccordionButton p={0}>
                                            <Box p='3'>{formatDateShort(date).slice(3)}</Box>
                                            <Spacer/>
                                            <Box p='3'>{distances.replace(' ', '/')}m</Box>
                                            <Spacer/>
                                            <Box p='3'>{formatMoney(m.valeur_fonciere)}</Box>
                                            <Spacer/>
                                            <Box p='3'>{formatMoney(m.price_per_square_lot)}</Box>
                                            <Spacer/>
                                            <Box p='3'>{formatMoney(m.price_per_square_srb)}</Box>
                                            <Spacer/>
                                            <Box p='3'><AccordionIcon/></Box>
                                        </AccordionButton>
                                    </Flex>
                                    <AccordionPanel pb={4} fontSize={10}>
                                        <pre style={{whiteSpace: "pre-wrap"}}>{JSON.stringify(m, null, 1)}</pre>
                                    </AccordionPanel>
                                </AccordionItem>
                            })}
                        </Accordion>
                    </> : <></>
                }
            </SimpleGrid>
        </Center>
    )
}

export default AdDetails
