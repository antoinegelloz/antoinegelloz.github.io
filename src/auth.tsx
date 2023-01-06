import {useState} from 'react'
import {supabaseClient} from './root'
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    Input, NumberInput, NumberInputField, Text
} from "@chakra-ui/react";

export default function Auth() {
    const [loading, setLoading] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')

    const handleLogin = async (e: { preventDefault: () => void }) => {
        e.preventDefault()

        try {
            setLoading(true)
            const {error} = await supabaseClient.auth.signInWithOtp({email})
            if (error) throw error
            alert('Lien magique envoyé !')
        } catch (error) {
            alert(JSON.stringify(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading ? (
                'Envoi du lien magique...'
            ) : (
                <Accordion allowMultiple>
                    <AccordionItem>
                        <h2>
                            <AccordionButton>
                                <Box as="span" flex='1' textAlign='left'>
                                    Se connecter
                                </Box>
                                <AccordionIcon/>
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <form onSubmit={handleLogin}>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='Email'
                                    size='sm'
                                />
                                <Button mt={2} type='submit'>
                                    Envoyer un lien magique
                                </Button>
                            </form>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            )}
        </>
    )
}