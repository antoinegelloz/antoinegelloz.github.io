import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Button,
    Center,
    Code,
    Heading,
    Image,
    ListItem,
    SimpleGrid,
    Spinner,
    Text,
    UnorderedList
} from "@chakra-ui/react";
import {useLoaderData} from "react-router-dom";
import {supabaseClient} from "./root";
import {Ad} from "./models";
import {formatDate, formatDateShort, formatDiff, formatMoney} from "./format";
import {Link, Box} from "@chakra-ui/react"
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
        return <Code>Error: {JSON.stringify(adArray, null, 4)}</Code>
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
                <br/>
                {ad.raw.images_url ?
                    ad.raw.images_url.map((imageURL) => (
                        <Image key={imageURL} src={imageURL} fallback={<Spinner></Spinner>}></Image>
                    )) : <></>
                }
                <Heading color="darkgray" mt={5}>Statistiques</Heading>
                <UnorderedList>
                    <ListItem key={"link"}>
                        <Link
                            href={encodeURI("https://www.google.com/maps/search/?api=1&query=" + ad.geojson.features[0].properties.label)}
                            isExternal={true}
                            variant='custom'>
                            {ad.geojson.features[0].properties.label}
                        </Link>
                    </ListItem>
                    <ListItem key={"price"}>{formatMoney(ad.price)}</ListItem>
                    {ad.raw.rooms > 1 ?
                        <ListItem key={"rooms"}>{ad.raw.rooms} pièces de {ad.area}m²</ListItem> :
                        <ListItem key={"rooms"}>{ad.raw.rooms} pièce de {ad.area}m²</ListItem>
                    }
                    <ListItem key={"price_sqm"}>{formatMoney(ad.price_sqm)}/m²</ListItem>
                    <ListItem key={"mel"}>Mise en ligne : {formatDate(Date.parse(ad.inserted_at))}</ListItem>
                    <ListItem key={"status"}>Statut : {ad.active ? "active" : "inactive"}</ListItem>
                    <ListItem key={"maj"}>Mis à jour : {formatDate(Date.parse(ad.updated_at))}</ListItem>
                </UnorderedList>
                <Address adID={ad.id}/>
                <Heading color="darkgrey" mt={5}>Mutations DVF</Heading>
                <UnorderedList>
                    <ListItem key={"mean"}>Moyenne de la zone : {formatMoney(ad.dvf.appt_price_sqm)}/m²
                        ({ad.dvf.appt_qty} ventes)</ListItem>
                    <ListItem
                        key={"diff"}>Différence
                        : {formatDiff((ad.price_sqm - ad.dvf.appt_price_sqm) / ad.dvf.appt_price_sqm * 100)}%
                        ({formatMoney(ad.price_sqm - ad.dvf.appt_price_sqm)}/m²)
                    </ListItem>
                </UnorderedList>
                {ad.dvf.mutations_agg ?
                    <Accordion allowMultiple>
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
