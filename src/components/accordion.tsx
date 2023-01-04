import {accordionAnatomy} from '@chakra-ui/anatomy'
import {createMultiStyleConfigHelpers} from '@chakra-ui/react'

const {definePartsStyle, defineMultiStyleConfig} =
    createMultiStyleConfigHelpers(accordionAnatomy.keys)

const baseStyle = definePartsStyle({
    button: {
        fontFamily: 'monospace',
        fontSize: '9px',
        whiteSpace: 'pre-wrap',
    },
    panel: {
        fontFamily: 'monospace',
        fontSize: '9px',
        whiteSpace: 'pre-wrap',
    }
})

export const accordionTheme = defineMultiStyleConfig({baseStyle})