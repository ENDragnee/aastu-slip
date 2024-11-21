import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    
    // Clear the specific cookies
    const cookiesToClear = ['userId', 'userGate']
    
    cookiesToClear.forEach(cookieName => {
      cookieStore.delete(cookieName)
    })
    
    // Create cookie clearing headers
    const cookieHeaders = cookiesToClear.map(cookieName => 
      `${cookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
    )
    
    return new NextResponse(
      JSON.stringify({ success: true, message: 'Logged out successfully' }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeaders
        }
      }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Logout failed' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

// Enable CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}