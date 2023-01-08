import {useState, useEffect} from 'react'
import {supabaseClient} from './root'
import {Session} from "@supabase/supabase-js";
import {
    Accordion, AccordionButton, AccordionIcon,
    AccordionItem, AccordionPanel, Box,
    Button, Code, Input, InputGroup, InputLeftAddon, InputRightAddon, Text
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
                                <Box as="span" flex='1' textAlign='left' fontSize={'13px'}>
                                    Bienvenue {props.session.user.email}
                                </Box>
                                <AccordionIcon/>
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <form onSubmit={updateProfile}>
                                <InputGroup size='md' mb={'10px'}>
                                    <InputLeftAddon children='Minimum'/>
                                    <Input placeholder='montant'
                                           type={'number'}
                                           defaultValue={minPrice.valueOf()}
                                           onChange={(e) => setMinPrice(Number(e.target.value))}
                                    />
                                    <InputRightAddon children='€'/>
                                </InputGroup>
                                <InputGroup size='md' mb={'10px'}>
                                    <InputLeftAddon children='Maximum'/>
                                    <Input placeholder='montant'
                                           type={'number'}
                                           defaultValue={maxPrice.valueOf()}
                                           onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    />
                                    <InputRightAddon children='€'/>
                                </InputGroup>
                                <Text mb='8px'>Localisation</Text>
                                <Input mb='8px'
                                       type={'text'}
                                       defaultValue={postcodes.length == 0 ?
                                           '75001, 75002' :
                                           postcodes.join(', ')}
                                       onChange={
                                           (e) => setPostcodes(e.target.value.split(',')
                                               .map(s => s.trim()))
                                       }
                                       placeholder='Codes postaux'>
                                </Input>
                                <Text mb='8px'>Notifications</Text>
                                <Code children='ntfy.sh/' fontSize={'sm'}/>
                                <Code children={props.session.user.id} fontSize={'sm'} mb={'10px'}/>
                                <Button mb='10px' type="submit" disabled={loading}>
                                    Mettre à jour
                                </Button>
                            </form>
                            <Button type="button"
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