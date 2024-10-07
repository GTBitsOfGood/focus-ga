export default async function Profile({ params }: { params: { id: string } }) {
  const id = params.id;

  return (
    <div>
      {id}
    </div>
  )
}