import db from '@/lib/db'; // Ensure this connects to your MySQL database

export async function POST(req) {
  const token = req.headers.get('authorization');

  // Check if the token matches the stored environment variable
  if (token !== `Bearer ${process.env.TRUNCATE_API_TOKEN}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    await db.query('TRUNCATE TABLE Request;');
    return new Response(JSON.stringify({ message: 'Request table truncated.' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error truncating table:', error);
    return new Response(JSON.stringify({ error: 'Failed to truncate table.' }), {
      status: 500,
    });
  }
}
