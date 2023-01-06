import {useState} from "react";
import {Alert, AlertDescription, AlertIcon, AlertTitle, Button, Heading, Input} from "@chakra-ui/react";
import {GeoJSON} from "./models";

interface HttpResponse<T> extends Response {
    parsedBody?: T;
}

export async function http<T>(request: RequestInfo): Promise<HttpResponse<T>> {
    const resp: HttpResponse<T> = await fetch(request);

    try {
        // may error if there is no body
        resp.parsedBody = await resp.json();
    } catch (ex) {
    }

    if (!resp.ok) {
        throw new Error(resp.statusText);
    }

    return resp;
}

export async function get<T>(path: string,
                             args: RequestInit = {
                                 method: "get"
                             }): Promise<HttpResponse<T>> {
    return await http<T>(new Request(path, args));
}

export async function putJSON<T>(path: string, body: any,
                                 args: RequestInit = {
                                     method: "put",
                                     body: JSON.stringify(body),
                                     headers: {
                                         "Content-Type": "application/json"
                                     }
                                 }): Promise<HttpResponse<T>> {
    return await http<T>(new Request(path, args));
}

function Address(props: { adID: number }) {
    const emptyGeoJSON: GeoJSON = {features: []}
    const [preciseAddress, setPreciseAddress] = useState<GeoJSON>(emptyGeoJSON)
    const [message, setMessage] = useState<string>("")
    const [error, setError] = useState<string>("")

    const searchAddress = async (address: string) => {
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
            console.log("searchAddress error", err);
            setError(JSON.stringify(err, null, "\t"))
            setPreciseAddress(emptyGeoJSON)
        }
    };

    const validateAddress = async () => {
        if (preciseAddress == emptyGeoJSON) {
            return
        }
        setPreciseAddress(emptyGeoJSON)
        setError("")
        let resp: HttpResponse<string>;
        try {
            resp = await putJSON<string>(
                'https://immo.gelloz.org/api/ads/' + props.adID.toString() + '/geojson',
                {geojson: preciseAddress})
            if (resp.parsedBody != undefined) {
                setMessage(resp.parsedBody)
            } else if (resp.status === 200) {
                setMessage("Nouvelle adresse : " + preciseAddress.features[0].properties.label)
            } else {
                setMessage(resp.status.toString() + " " + resp.statusText)
            }
        } catch (err) {
            console.log("validateAddress error", err);
            setError(JSON.stringify(err, null, "\t"))
            setPreciseAddress(emptyGeoJSON)
        }
    }

    return (
        <>
            <Heading color="darkgrey" mt={5}>Modifier l&apos;adresse</Heading>
            <Input onChange={(e) => searchAddress(e.target.value)}></Input>
            <Button colorScheme='blue' onClick={validateAddress}>OK</Button>
            {preciseAddress.features.length > 0 ?
                <p>{preciseAddress.features[0].properties.label}</p> :
                <p>&#8205;</p>
            }
            {error ?
                <Alert status='error'>
                    <AlertIcon/>
                    <AlertTitle>Erreur !</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert> : <></>
            }
            {message ?
                <Alert status='info'>
                    <AlertIcon/>
                    <AlertTitle>En cours</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                </Alert> : <></>
            }
        </>
    )
}

export default Address
