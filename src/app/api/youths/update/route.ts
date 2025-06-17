export async function POST(request: Request) {
  const body = await request.json();
  console.log('Received POST request with body:', body);
  // This is a placeholder for the GET request handler
  // You can implement your logic here
  return Response.json({
    success: true,
    data: {
      _id: '12345',
      message: 'POST request successful',
    }
  }, { status: 200 });
}