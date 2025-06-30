interface KVRequest {
  action: 'get' | 'put' | 'delete'
  key: string
  value?: any
}

interface KVResponse {
  success: boolean
  data?: any
  error?: string
}

export async function onRequest(context: any) {
  const { request } = context
  const { env } = context

  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  try {
    const body: KVRequest = await request.json()
    const { action, key, value } = body

    if (!action || !key) {
      return new Response(JSON.stringify({ success: false, error: 'Missing action or key' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    let result: KVResponse

    switch (action) {
      case 'get':
        const data = await env.EXPENSE_TRACKER_KV.get(key, { type: 'json' })
        result = { success: true, data }
        break

      case 'put':
        await env.EXPENSE_TRACKER_KV.put(key, JSON.stringify(value))
        result = { success: true }
        break

      case 'delete':
        await env.EXPENSE_TRACKER_KV.delete(key)
        result = { success: true }
        break

      default:
        result = { success: false, error: 'Invalid action' }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('KV API error:', error)
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
} 