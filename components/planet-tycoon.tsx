"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, Factory, Leaf, Droplets, Users, Cpu, Zap, ShieldAlert, Rocket, BarChart3 } from "lucide-react"

// Game state interface
interface GameState {
  credits: number
  population: number
  food: number
  water: number
  oxygen: number
  energy: number
  minerals: number
  research: number
  buildings: Building[]
  day: number
}

// Building interface
interface Building {
  id: string
  name: string
  type: "habitat" | "farm" | "waterPlant" | "oxygenGenerator" | "powerPlant" | "mine" | "lab"
  level: number
  cost: number
  production: {
    population?: number
    food?: number
    water?: number
    oxygen?: number
    energy?: number
    minerals?: number
    research?: number
  }
  energyUsage: number
  icon: React.ReactNode
}

// Building templates
const buildingTemplates: Record<string, Omit<Building, "id">> = {
  habitat: {
    name: "Habitat Dome",
    type: "habitat",
    level: 1,
    cost: 100,
    production: { population: 10 },
    energyUsage: 5,
    icon: <Building2 className="h-5 w-5" />,
  },
  farm: {
    name: "Hydroponic Farm",
    type: "farm",
    level: 1,
    cost: 80,
    production: { food: 15 },
    energyUsage: 8,
    icon: <Leaf className="h-5 w-5" />,
  },
  waterPlant: {
    name: "Water Extraction Plant",
    type: "waterPlant",
    level: 1,
    cost: 120,
    production: { water: 20 },
    energyUsage: 10,
    icon: <Droplets className="h-5 w-5" />,
  },
  oxygenGenerator: {
    name: "Oxygen Generator",
    type: "oxygenGenerator",
    level: 1,
    cost: 150,
    production: { oxygen: 15 },
    energyUsage: 12,
    icon: <ShieldAlert className="h-5 w-5" />,
  },
  powerPlant: {
    name: "Solar Power Plant",
    type: "powerPlant",
    level: 1,
    cost: 200,
    production: { energy: 25 },
    energyUsage: 0,
    icon: <Zap className="h-5 w-5" />,
  },
  mine: {
    name: "Mining Facility",
    type: "mine",
    level: 1,
    cost: 180,
    production: { minerals: 15 },
    energyUsage: 15,
    icon: <Factory className="h-5 w-5" />,
  },
  lab: {
    name: "Research Lab",
    type: "lab",
    level: 1,
    cost: 250,
    production: { research: 10 },
    energyUsage: 20,
    icon: <Cpu className="h-5 w-5" />,
  },
}

// Initial game state
const initialState: GameState = {
  credits: 500,
  population: 10,
  food: 100,
  water: 100,
  oxygen: 100,
  energy: 50,
  minerals: 50,
  research: 0,
  buildings: [
    { ...buildingTemplates.habitat, id: "habitat-1" },
    { ...buildingTemplates.powerPlant, id: "powerPlant-1" },
  ],
  day: 1,
}

export default function PlanetTycoon() {
  const [gameState, setGameState] = useState<GameState>(initialState)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [gameSpeed, setGameSpeed] = useState<number>(1) // 1 = normal, 0 = paused, 2 = fast
  const [gameOver, setGameOver] = useState(false)

  // Game tick function - runs every second when game is not paused
  useEffect(() => {
    if (gameOver) return

    const interval = setInterval(() => {
      if (gameSpeed === 0) return

      setGameState((prevState) => {
        // Calculate production and consumption
        let newFood = prevState.food
        let newWater = prevState.water
        let newOxygen = prevState.oxygen
        let newEnergy = prevState.energy
        let newMinerals = prevState.minerals
        let newResearch = prevState.research
        let newCredits = prevState.credits
        let newPopulation = prevState.population

        // Calculate total energy production and usage
        const energyProduction = prevState.buildings
          .filter((b) => b.type === "powerPlant")
          .reduce((sum, b) => sum + (b.production.energy || 0), 0)

        const energyUsage = prevState.buildings.reduce((sum, b) => sum + b.energyUsage, 0)

        // Calculate resource production from buildings
        prevState.buildings.forEach((building) => {
          if (building.production.food) newFood += building.production.food / (10 / gameSpeed)
          if (building.production.water) newWater += building.production.water / (10 / gameSpeed)
          if (building.production.oxygen) newOxygen += building.production.oxygen / (10 / gameSpeed)
          if (building.production.minerals) newMinerals += building.production.minerals / (10 / gameSpeed)
          if (building.production.research) newResearch += building.production.research / (10 / gameSpeed)
        })

        // Population consumes resources
        newFood -= (prevState.population * 0.5) / (10 / gameSpeed)
        newWater -= (prevState.population * 0.3) / (10 / gameSpeed)
        newOxygen -= (prevState.population * 0.2) / (10 / gameSpeed)

        // Population growth if resources are sufficient
        if (newFood > 0 && newWater > 0 && newOxygen > 0) {
          const growthRate = 0.01 / (10 / gameSpeed)
          const populationIncrease = Math.random() < growthRate ? 1 : 0
          newPopulation += populationIncrease
        }

        // Credits from population (taxes/work)
        newCredits += (prevState.population * 0.5) / (10 / gameSpeed)

        // Energy balance
        newEnergy = energyProduction - energyUsage

        // Ensure values don't go below 0
        newFood = Math.max(0, newFood)
        newWater = Math.max(0, newWater)
        newOxygen = Math.max(0, newOxygen)
        newEnergy = Math.max(0, newEnergy)

        // Check for game over conditions
        if (newFood <= 0 || newWater <= 0 || newOxygen <= 0) {
          setGameOver(true)
        }

        return {
          ...prevState,
          food: newFood,
          water: newWater,
          oxygen: newOxygen,
          energy: newEnergy,
          minerals: newMinerals,
          research: newResearch,
          credits: newCredits,
          population: newPopulation,
          day: prevState.day + 1 / (10 / gameSpeed),
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameSpeed, gameOver])

  // Build a new building
  const buildStructure = (type: string) => {
    const template = buildingTemplates[type as keyof typeof buildingTemplates]
    if (!template || gameState.credits < template.cost) return

    const newBuilding: Building = {
      ...template,
      id: `${type}-${Date.now()}`,
    }

    setGameState((prev) => ({
      ...prev,
      credits: prev.credits - template.cost,
      buildings: [...prev.buildings, newBuilding],
    }))
  }

  // Upgrade a building
  const upgradeBuilding = (buildingId: string) => {
    const building = gameState.buildings.find((b) => b.id === buildingId)
    if (!building) return

    const upgradeCost = building.cost * 0.75 * building.level

    if (gameState.credits < upgradeCost) return

    setGameState((prev) => ({
      ...prev,
      credits: prev.credits - upgradeCost,
      buildings: prev.buildings.map((b) => {
        if (b.id === buildingId) {
          // Increase production by 50% per level
          const newProduction: Record<string, number> = {}
          Object.entries(b.production).forEach(([key, value]) => {
            newProduction[key] = value * 1.5
          })

          return {
            ...b,
            level: b.level + 1,
            production: newProduction as Building["production"],
            energyUsage: Math.round(b.energyUsage * 1.2), // Energy usage increases by 20%
          }
        }
        return b
      }),
    }))
  }

  // Reset game
  const resetGame = () => {
    setGameState(initialState)
    setGameOver(false)
    setGameSpeed(1)
  }

  return (
    <div className="w-full">
      {gameOver ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Game Over</CardTitle>
            <CardDescription className="text-center">Your colony has failed due to resource depletion.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>You survived for {Math.floor(gameState.day)} days.</p>
            <p>Final population: {Math.floor(gameState.population)}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={resetGame}>Start New Colony</Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Day {Math.floor(gameState.day)}</h2>
            </div>
            <div className="flex gap-2">
              <Button variant={gameSpeed === 0 ? "default" : "outline"} onClick={() => setGameSpeed(0)} size="sm">
                Pause
              </Button>
              <Button variant={gameSpeed === 1 ? "default" : "outline"} onClick={() => setGameSpeed(1)} size="sm">
                Normal
              </Button>
              <Button variant={gameSpeed === 2 ? "default" : "outline"} onClick={() => setGameSpeed(2)} size="sm">
                Fast
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Population</p>
                  <p className="text-xl">{Math.floor(gameState.population)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Credits</p>
                  <p className="text-xl">{Math.floor(gameState.credits)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Energy</p>
                  <p className="text-xl">{Math.floor(gameState.energy)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Research</p>
                  <p className="text-xl">{Math.floor(gameState.research)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="build">Build</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Colony Status</CardTitle>
                  <CardDescription>Monitor your colony's vital resources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Food</span>
                      <span className="text-sm">{Math.floor(gameState.food)}</span>
                    </div>
                    <Progress value={(gameState.food / 200) * 100} className="h-2 bg-muted" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Water</span>
                      <span className="text-sm">{Math.floor(gameState.water)}</span>
                    </div>
                    <Progress value={(gameState.water / 200) * 100} className="h-2 bg-muted" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Oxygen</span>
                      <span className="text-sm">{Math.floor(gameState.oxygen)}</span>
                    </div>
                    <Progress value={(gameState.oxygen / 200) * 100} className="h-2 bg-muted" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Minerals</span>
                      <span className="text-sm">{Math.floor(gameState.minerals)}</span>
                    </div>
                    <Progress value={(gameState.minerals / 200) * 100} className="h-2 bg-muted" />
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Buildings</CardTitle>
                  <CardDescription>Your colony's infrastructure</CardDescription>
                </CardHeader>
                <CardContent>
                  {gameState.buildings.length === 0 ? (
                    <p className="text-muted-foreground">No buildings yet. Start building!</p>
                  ) : (
                    <div className="space-y-2">
                      {gameState.buildings.map((building) => (
                        <div key={building.id} className="flex justify-between items-center p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            {building.icon}
                            <div>
                              <p className="font-medium">{building.name}</p>
                              <p className="text-xs text-muted-foreground">Level {building.level}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => upgradeBuilding(building.id)}
                            disabled={gameState.credits < building.cost * 0.75 * building.level}
                          >
                            Upgrade ({Math.floor(building.cost * 0.75 * building.level)})
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="build">
              <Card>
                <CardHeader>
                  <CardTitle>Build Structures</CardTitle>
                  <CardDescription>Expand your colony with new buildings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(buildingTemplates).map(([key, building]) => (
                      <Card key={key} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {building.icon}
                              {building.name}
                            </CardTitle>
                            <Badge variant="outline">{building.cost} credits</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-sm space-y-1">
                            {Object.entries(building.production).map(([resource, amount]) => (
                              <p key={resource}>
                                +{amount} {resource}/day
                              </p>
                            ))}
                            <p className="text-muted-foreground">Energy usage: {building.energyUsage}/day</p>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button
                            className="w-full"
                            onClick={() => buildStructure(key)}
                            disabled={gameState.credits < building.cost}
                          >
                            Build
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="research">
              <Card>
                <CardHeader>
                  <CardTitle>Research</CardTitle>
                  <CardDescription>Discover new technologies</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Research features will be available in future updates.
                    <br />
                    Current research points: {Math.floor(gameState.research)}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

