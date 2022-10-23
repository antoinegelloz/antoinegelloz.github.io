import {useState} from "react";
import {Heading, Input} from "@chakra-ui/react";
import {GeoJSON} from "./root";

function Address() {
    const emptyGeoJSON: GeoJSON = {features: []}
    const [preciseAddress, setPreciseAddress] = useState<GeoJSON>(emptyGeoJSON)
    const [message, setMessage] = useState<string>("")
    const [error, setError] = useState<string>("")

    const searchAddress = async (address: string) => {
        if (address.length < 5) {
            setPreciseAddress(emptyGeoJSON)
            return
        }

        fetch('https://api-adresse.data.gouv.fr/search/?q=' + address.replace(/ /g, "+") + '&limit=1')
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.body;
            }).then(readableStream => {
            if (!readableStream) {
                return
            }

            const reader = readableStream.getReader();
            return new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(({done, value}) => {
                            if (done) {
                                controller.close()
                                return
                            }
                            controller.enqueue(value)
                            push()
                        })
                    }

                    push()
                }
            });
        }).then(stream => {
            return new Response(stream, {headers: {"Content-Type": "application/json"}}).json();
        }).then(featureCollection => {
            if (!featureCollection ||
                featureCollection.features == undefined ||
                featureCollection.features.length == 0) {
                setPreciseAddress(emptyGeoJSON)
                return
            }

            let f: GeoJSON = featureCollection
            if (f.features[0].properties.type == 'housenumber'
                && f.features[0].properties.score > 0.8) {
                setPreciseAddress(f)
                setError('')
                setMessage('')
            } else {
                setPreciseAddress(emptyGeoJSON)
            }
        }).catch(error => {
            setError("Erreur de recherche d'adresse: " + error);
        });
    };

    return (
        <>
            <Heading color="darkgrey" mt={5}>Modifier l&apos;adresse</Heading>
            <Input onChange={(e) => searchAddress(e.target.value)}></Input>
            {preciseAddress.features.length > 0 ?
                <p>{preciseAddress.features[0].properties.label}</p> :
                <p>&#8205;</p>
            }
            {error && <div style={{color: 'red'}}>{error}</div>}
            {message && <div style={{color: 'lightskyblue'}}>{message}</div>}
        </>
    )
}

export default Address
