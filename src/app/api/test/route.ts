export async function GET() {
  // This is a placeholder for the GET request handler
  // You can implement your logic here
  return Response.json({
    message: 'GET request successful',
    user: { name: 'Alice', age: 30 }
  }, { status: 200 });
}