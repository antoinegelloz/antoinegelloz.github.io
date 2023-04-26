export const formatDateShort = (date: number) => new Intl.DateTimeFormat(
    'fr-FR', {dateStyle: 'short'},
).format(date);

export const formatMoney = (amount: number) => new Intl.NumberFormat(
    'fr-FR',
    {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    },
).format(amount);

export const formatMoneyDiff = (amount: number) => {
    const f = new Intl.NumberFormat(
        'fr-FR',
        {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        },
    )
    if (amount > 1) {
        return '+' + f.format(amount)
    }

    return f.format(amount)
}

export const formatDiff = (amount: number) => {
    if (amount > 1) {
        return "+" + amount.toFixed(0)
    }

    return amount.toFixed(0)
}
