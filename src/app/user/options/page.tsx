export default function OptionsPage() {
  return (
    <main>
      <div className="text-txt-50 flex min-h-screen">
        <div className="border-1accent flex w-1/2 flex-col border text-center">
          <h1>Left Screen</h1>
        </div>
        <div className="flex w-1/2 flex-col border border-blue-500 text-center">
          <h1>Right Screen</h1>
        </div>
      </div>
    </main>
  );
}
