export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phoneNumber, message } = req.body

  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'Missing phoneNumber or message' })
  }

  try {
    const response = await fetch('https://api.sandbox.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        apiKey: process.env.AFRICASTALKING_API_KEY,
      },
      body: new URLSearchParams({
        username: process.env.AFRICASTALKING_USERNAME,
        to: phoneNumber,
        message: message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Africa\'s Talking error:', data)
      return res.status(500).json({ error: 'Failed to send SMS', details: data })
    }

    return res.status(200).json({ success: true, data })
  } catch (err) {
    console.error('SMS send exception:', err)
    return res.status(500).json({ error: err.message })
  }
}