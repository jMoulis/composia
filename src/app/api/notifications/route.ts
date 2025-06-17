export async function POST(request: Request) {
  const body = await request.json();
  console.log('Received POST request with body:', body);
  // This is a placeholder for the GET request handler
  // You can implement your logic here
  const fakeNotifications = [
    { id: 1, message: 'Notification 1', read: false },
    { id: 2, message: 'Notification 2', read: true },
    { id: 3, message: 'Notification 3', read: false },
  ];
  return Response.json({
    success: true,
    data: fakeNotifications
  }, { status: 200 });
}