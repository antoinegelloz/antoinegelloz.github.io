import {useState, useEffect} from 'react'
import {supabaseClient} from './root'
import {Session} from "@supabase/supabase-js";
import {Button, NumberInput, NumberInputField, Text} from "@chakra-ui/react";

function Account(props: { session: Session }) {
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
            let {data, error, status} = await supabaseClient
                .from('profiles')
                .select(`min_price, max_price, postcodes`)
                .eq('id', props.session.user.id)
                .single()

            if (error && status !== 406) {
                throw error
            }

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
                minPrice,
                maxPrice,
                postcodes,
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
                'Saving...'
            ) : (
                <form onSubmit={updateProfile}>
                    <Text mb='8px'>Email: {props.session.user.email}</Text>
                    <Text mb='8px'>Prix minimum</Text>
                    <NumberInput defaultValue={minPrice.valueOf()}
                                 onChange={(s, n) => setMinPrice(n)}>
                        <NumberInputField/>
                    </NumberInput>
                    <Text mb='8px'>Prix maximum</Text>
                    <NumberInput defaultValue={maxPrice.valueOf()}
                                 onChange={(s, n) => setMaxPrice(n)}>
                        <NumberInputField/>
                    </NumberInput>
                    <Button mt={2} type="submit" disabled={loading}>
                        Update profile
                    </Button>
                </form>
            )}
            <Button mt={2} type="button" onClick={() => supabaseClient.auth.signOut()}>
                Sign Out
            </Button>
        </>
    )
}

export default Account