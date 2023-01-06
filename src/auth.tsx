import {useState} from 'react'
import {supabaseClient} from './root'
import {Button, Input} from "@chakra-ui/react";

export default function Auth() {
    const [loading, setLoading] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')

    const handleLogin = async (e: { preventDefault: () => void }) => {
        e.preventDefault()

        try {
            setLoading(true)
            const {error} = await supabaseClient.auth.signInWithOtp({email})
            if (error) throw error
            alert('Check your email for the login link!')
        } catch (error) {
            alert(JSON.stringify(error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading ? (
                'Sending magic link...'
            ) : (
                <form onSubmit={handleLogin}>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Email'
                        size='sm'
                    />
                    <Button mt={2} type='submit'>
                        Send magic link
                    </Button>
                </form>
            )}
        </>
    )
}