import OrderDetailsPage from './OrderDetailsPage';

export default async function Page(props: { params: { orderId: string } }) {
  // Wrap params in a Promise to satisfy the expected type
  const params = Promise.resolve(props.params);

  return <OrderDetailsPage params={params} />;
}
