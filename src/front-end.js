import uuid from 'uuid/v4'
const handler = StripeCheckout.configure({
  key: process.env.STRIPE_PUBLISHABLE_KEY,
  image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
  locale: 'auto',
  token: async token => {
    let response, data

    try {
      response = await fetch(process.env.LAMBDA_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          token,
          amount,
          idempotency_key: uuid(),
        }),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      })

      data = await response.json()
    } catch (error) {
      console.error(error.message)
      return
    }
  },
})

// front-end.js

// Stripe handles pricing in cents, so this is actually $10.00.
const amount = 1000

document.querySelector('button').addEventListener('click', function() {
  handler.open({
    amount,
    name: 'Test Shop',
    description: 'A Fantastic New Widget',
  })
})
