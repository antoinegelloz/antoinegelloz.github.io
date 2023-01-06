import {useState, useEffect} from 'react'
import {supabaseClient} from './root'
import {Session} from "@supabase/supabase-js";
import {
    Accordion,
    AccordionButton, AccordionIcon,
    AccordionItem, AccordionPanel, Box,
    Button,
    Input,
    NumberInput,
    NumberInputField,
    Text
} from "@chakra-ui/react";

function Profile(props: { session: Session }) {
    const [loading, setLoading] = useState(true)
    const [minPrice, setMinPrice] = useState<Number>(0)
    const [maxPrice, setMaxPrice] = useState<Number>(0)
    const [postcodes, setPostcodes] = useState<String[]>([])

    useEffect(() => {
        getProfile().then(r =>
            console.log('getProfile done', r)
        )
    }, [props.session])

    const getProfile = async () => {
        try {
            setLoading(true)
            let {data, error, status, statusText} = await supabaseClient
                .from('profiles')
                .select('min_price, max_price, postcodes')
                .eq('id', props.session.user.id)
                .single()
            if (error && status !== 406) {
                console.log('getProfile error', error, 'status', status, 'statusText', statusText)
                throw error
            }

            console.log('getProfile', data)
            if (data) {
                setMinPrice(data.min_price ? data.min_price : 0)
                setMaxPrice(data.max_price ? data.max_price : 0)
                setPostcodes(data.postcodes ? data.postcodes : [])
            }
        } catch (error) {
            alert(JSON.stringify(error))
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async (e: { preventDefault: () => void }) => {
        e.preventDefault()

        try {
            setLoading(true)
            const updates = {
                id: props.session.user.id,
                min_price: minPrice,
                max_price: maxPrice,
                postcodes: postcodes,
                updated_at: new Date(),
            }

            let {error} = await supabaseClient
                .from('profiles')
                .upsert(updates)
            if (error) {
                throw error
            }
        } catch (error) {
            alert(JSON.stringify(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading ? (
                'Mise à jour...'
            ) : (
                <Accordion allowMultiple>
                    <AccordionItem>
                        <h2>
                            <AccordionButton>
                                <Box as="span" flex='1' textAlign='left'>
                                    Email: {props.session.user.email}
                                </Box>
                                <AccordionIcon/>
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <form onSubmit={updateProfile}>
                                <Text mb='8px'>Prix minimum</Text>
                                <NumberInput mb='8px' defaultValue={minPrice.valueOf()}
                                             onChange={(s, n) => setMinPrice(n)}>
                                    <NumberInputField/>
                                </NumberInput>
                                <Text mb='8px'>Prix maximum</Text>
                                <NumberInput mb='8px' defaultValue={maxPrice.valueOf()}
                                             onChange={(s, n) => setMaxPrice(n)}>
                                    <NumberInputField/>
                                </NumberInput>
                                <Text mb='8px'>Localisation</Text>
                                <Input mb='8px'
                                       defaultValue={postcodes.length === 0 ? '75011, 75019' : postcodes.join(', ')}
                                       onChange={
                                           (e) => setPostcodes(e.target.value.split(',')
                                               .map(s => s.trim()))
                                       }
                                       placeholder='Codes postaux'>
                                </Input>
                                <Button mt={2} type="submit" disabled={loading}>
                                    Mettre à jour
                                </Button>
                            </form>
                            <Button mt={2} type="button"
                                    onClick={() => supabaseClient.auth.signOut()}>
                                Se déconnecter
                            </Button>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            )}
        </>
    )
}

export default Profile