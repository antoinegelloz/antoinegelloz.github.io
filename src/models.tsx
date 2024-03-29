export type Ad = {
    id: number
    inserted_at: string
    updated_at: string
    unique_id: string
    description: string
    price: number
    area: number
    rooms: number
    property_type: string
    floor: number | null
    website: string

    postal_code: string

    price_sqm: number
    geojson: GeoJSON
    dvf: DVF
    active: boolean

    guessed_floor: string
    guessed_address: string

    raw: RawAd
}

export type GeoJSON = {
    features: Feature[]
}

type DVF = {
    radius_meter: number
    appt_qty: number
    appt_price_sqm: number
    mutations_agg: AggMutations[]
}

type AggMutations = {
    id_mutation: string
    date_mutation: string
    valeur_fonciere: number
    price_sqm_lot: number
    price_sqm_srb: number
    distances_m: number[]
    id_parcelles: string[]
}

type Feature = {
    properties: Properties
}

type Properties = {
    label: string
    type: string
    score: number
}

type RawAd = {
    title: string
    description: string
    url: string
    rooms: number
    images_url: string[]
}

export type Config = {
    postal_codes: string[]
    min_price: number
    max_price: number
}
