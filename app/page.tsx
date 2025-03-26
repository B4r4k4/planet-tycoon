import PlanetTycoon from "@/components/planet-tycoon"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center my-8">Planet Tycoon</h1>
        <PlanetTycoon />
      </div>
    </main>
  )
}

