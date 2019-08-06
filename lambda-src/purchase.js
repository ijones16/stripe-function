require('dotenv').config()

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const statusCode = 200
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
}
const OK_RESPONSE = {
  statusCode,
  headers,
}

exports.handler = async function(event) {
  console.log(process.env.STRIPE_SECRET_KEY)

  if (event.httpMethod !== 'POST') {
    return {
      ...OK_RESPONSE,
      body: 'This was not a post.',
    }
  }
  console.log(event.body)
  const data = JSON.parse(event.body)

  if (!data.token || !data.amount || !data.idempotency_key) {
    const message = 'Required information is missing!'

    console.error(message)

    return {
      ...OK_RESPONSE,
      body: JSON.stringify({
        status: 'failed',
        message,
      }),
    }
  }
  let charge

  try {
    charge = await stripe.charges.create(
      {
        currency: 'usd',
        amount: data.amount,
        source: data.token.id,
        receipt_email: data.token.email,
        description: `charge for a widget`,
      },
      {
        idempotency_key: data.idempotency_key,
      },
    )
  } catch (e) {
    let message = e.message
    console.error(message)

    return {
      headers,
      statusCode: 424,
      body: JSON.stringify({
        status: 'failed',
        message,
      }),
    }
  }

  const status =
    charge === null || charge.status !== 'succeeded' ? 'failed' : charge.status
  console.log(charge)
  return {
    ...OK_RESPONSE,
    body: JSON.stringify({
      status,
      message: 'Charge successfully created!',
    }),
  }
}
