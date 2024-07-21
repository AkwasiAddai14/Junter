import React from 'react'

interface checkout {
    afbeelding: string,
    opdrachtnemer: string,
    datum: string,
    begintijd: string,
    eindtijd: string,
    pauze: number,
}

interface Props {
    checkout: checkout
}

const CheckoutCard: React.FC<Props> = ({checkout}) => {
  return (
    <>
    <h2>{checkout.afbeelding}</h2>
    <h2>{checkout.opdrachtnemer}</h2>
    <h2>{checkout.datum}</h2>
    <h2>{checkout.begintijd}</h2>
    <h2>{checkout.eindtijd}</h2>
    <h2>{checkout.pauze}</h2>
    </>
  )
}

export default CheckoutCard