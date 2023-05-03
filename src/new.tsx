import {useState} from "react";
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Button, Center,
    Input,
    Spinner, Stack
} from "@chakra-ui/react";
import {GeoJSON} from "./models";
import {get, HttpResponse, postJSON} from "./http";

function New() {
    const emptyGeoJSON: GeoJSON = {features: []}
    const [preciseAddress, setPreciseAddress] = useState<GeoJSON>(emptyGeoJSON)
    const [message, setMessage] = useState<string>("")
    const [error, setError] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    const [description, setDescription] = useState<string>("")
    const [price, setPrice] = useState<number>(1)
    const [area, setArea] = useState<number>(1)
    const [rooms, setRooms] = useState<number>(1)
    const [floor, setFloor] = useState<number>(0)

    const searchAddress = async (address: string) => {
        setError("")
        setMessage("")
        if (address.length < 5) {
            setPreciseAddress(emptyGeoJSON)
            setError("")
            return
        }

        let resp: HttpResponse<GeoJSON>;
        try {
            let path = 'https://api-adresse.data.gouv.fr/search/?q='
                + address.replace(/ /g, "+") + '&limit=1'
            resp = await get<GeoJSON>(path)
            if (resp.parsedBody != undefined && resp.parsedBody.features.length == 1) {
                setPreciseAddress(resp.parsedBody)
                setError("")
            }
        } catch (err) {
            console.error("searchAddress error", err);
            setError(JSON.stringify(err, null, "\t"))
            setPreciseAddress(emptyGeoJSON)
        }
    };

    const validate = async () => {
        if (preciseAddress == emptyGeoJSON) {
            return
        }
        setLoading(true)
        setPreciseAddress(emptyGeoJSON)
        setError("")
        let resp: HttpResponse<string>;
        try {
            resp = await postJSON<string>(
                'https://immo.gelloz.org/api/ads',
                {
                    description: description,
                    price: price,
                    area: area,
                    rooms: rooms,
                    floor: floor,
                    website: "manual",
                    geojson: preciseAddress
                })
            if (resp.status != 200) {
                console.error("validate error", resp);
                setError(JSON.stringify(resp, null, "\t"))
                return
            }
            console.log("validate OK", preciseAddress);
            setMessage("Nouvelle annonce créée !")
        } catch (err) {
            console.error("validate error caught", err);
            setError(JSON.stringify(err, null, "\t"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Center padding={6}>
            <Stack spacing={4} width={'100%'}>
                <Button onClick={() => close()}>
                    &#x276E; Retour
                </Button>
                <Input
                    type='text'
                    placeholder='Description'
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Input
                    type='number'
                    placeholder='Prix'
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                />
                <Input
                    type='number'
                    placeholder='Surface'
                    onChange={(e) => setArea(parseInt(e.target.value))}
                />
                <Input
                    type='number'
                    placeholder='Pièces'
                    onChange={(e) => setRooms(parseInt(e.target.value))}
                />
                <Input
                    type='number'
                    placeholder='Étage'
                    onChange={(e) => setFloor(parseInt(e.target.value))}
                />
                <Input
                    type='search'
                    placeholder='Adresse'
                    onChange={(e) => searchAddress(e.target.value)}
                />
                {preciseAddress.features.length > 0 ?
                    <p>{preciseAddress.features[0].properties.label}</p> :
                    <p>&#8205;</p>
                }
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
                            Erreur
                        </AlertTitle>
                        <AlertDescription maxWidth='sm'>
                            {error}
                        </AlertDescription>
                    </Alert> : <></>
                }
                {message ?
                    <Alert
                        status='info'
                        variant='subtle'
                        flexDirection='column'
                        alignItems='center'
                        justifyContent='center'
                        textAlign='center'
                        height='200px'
                    >
                        <AlertIcon boxSize='40px' mr={0}/>
                        <AlertTitle mt={4} mb={1} fontSize='lg'>
                            Adresse modifiée
                        </AlertTitle>
                        <AlertDescription maxWidth='sm'>
                            {message}
                        </AlertDescription>
                    </Alert> : <></>
                }
                {loading ?
                    <Alert
                        status='info'
                        variant='subtle'
                        flexDirection='column'
                        alignItems='center'
                        justifyContent='center'
                        textAlign='center'
                        height='200px'
                    >
                        <AlertIcon boxSize='40px' mr={0}/>
                        <AlertTitle mt={4} mb={1} fontSize='lg'>
                            En cours
                        </AlertTitle>
                        <AlertDescription maxWidth='sm'>
                            <Spinner></Spinner>
                        </AlertDescription>
                    </Alert> : <></>
                }
                <Button h='1.75rem' size='sm' onClick={validate}>
                    OK
                </Button>
            </Stack>
        </Center>
    )
}

export default New
