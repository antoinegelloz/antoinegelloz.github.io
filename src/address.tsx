import {useState} from "react";
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Button,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    Spinner
} from "@chakra-ui/react";
import {GeoJSON} from "./models";
import {get, HttpResponse, putJSON} from "./http";

function Address(props: { adID: number, adAddress: string }) {
    const emptyGeoJSON: GeoJSON = {features: []}
    const [preciseAddress, setPreciseAddress] = useState<GeoJSON>(emptyGeoJSON)
    const [message, setMessage] = useState<string>("")
    const [error, setError] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

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

    const validateAddress = async () => {
        if (preciseAddress == emptyGeoJSON) {
            return
        }
        setLoading(true)
        setPreciseAddress(emptyGeoJSON)
        setError("")
        let resp: HttpResponse<string>;
        try {
            resp = await putJSON<string>(
                'https://immo.gelloz.org/api/ads/' + props.adID.toString() + '/geojson',
                {geojson: preciseAddress})
            if (resp.status != 200) {
                console.error("validateAddress error", resp);
                setError(JSON.stringify(resp, null, "\t"))
                return
            }
            console.log("validateAddress OK", preciseAddress);
            setMessage("Nouvelle adresse : " + preciseAddress.features[0].properties.label)
        } catch (err) {
            console.error("validateAddress error caught", err);
            setError(JSON.stringify(err, null, "\t"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Heading size='s' textTransform='uppercase'>
                Modifier l'adresse
            </Heading>
            <InputGroup size='md' mt='10px' mb='10px'>
                <Input
                    pr='4.5rem'
                    type='search'
                    placeholder='Nouvelle adresse'
                    value={props.adAddress}
                    onChange={(e) => searchAddress(e.target.value)}
                />
                <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={validateAddress}>
                        OK
                    </Button>
                </InputRightElement>
            </InputGroup>
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
        </>
    )
}

export default Address
