import {Code} from "@chakra-ui/react";
import {useLoaderData} from "react-router-dom";
import {Ad, supabaseClient} from "./root";

export async function loader(props: any) {
    const {data, error} = await supabaseClient.from("ads")
        .select("*").eq('id', props.params.adId)
    if (error) {
        console.log(error)
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
    return <Code>{JSON.stringify(ad, null, 4)}</Code>
}

export default AdDetails
