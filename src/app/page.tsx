'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, 
  Plus, 
  AlertTriangle, 
  Shield, 
  Users, 
  Building,
  Navigation,
  Upload,
  X,
  Check,
  Clock,
  Eye,
  Lock
} from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import { useAuth } from '@/hooks/use-auth'

interface Pin {
  id: string
  type: 'damaged' | 'safe'
  status: 'pending' | 'confirmed' | 'completed'
  title: string
  description: string
  lat: number
  lng: number
  createdBy: string
  createdAt: Date
  image?: string
  assignedTo?: string
}

// Mock data for demonstration
const mockPins: Pin[] = [
  {
    id: '1',
    type: 'damaged',
    status: 'confirmed',
    title: 'Building Collapse',
    description: 'Multi-story building collapsed, need immediate rescue',
    lat: 16.8409,
    lng: 96.1735,
    createdBy: 'Volunteer Team A',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    assignedTo: 'Rescue Team B'
  },
  {
    id: '2',
    type: 'safe',
    status: 'confirmed',
    title: 'Emergency Shelter',
    description: 'School gym converted to emergency shelter',
    lat: 16.8509,
    lng: 96.1835,
    createdBy: 'City Authority',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: '3',
    type: 'damaged',
    status: 'pending',
    title: 'Road Damage',
    description: 'Major road blocked by fallen trees',
    lat: 16.8309,
    lng: 96.1635,
    createdBy: 'Anonymous User',
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  }
]

export default function HomePage() {
  const { t, language } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const [pins, setPins] = useState<Pin[]>(mockPins)
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [pinType, setPinType] = useState<'damaged' | 'safe'>('damaged')
  const [pinTitle, setPinTitle] = useState('')
  const [pinDescription, setPinDescription] = useState('')
  const [pinImage, setPinImage] = useState<File | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 16.8409, lng: 96.1735 })
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter(location)
        },
        (error) => {
          console.error('Error getting location:', error)
          // Default to Yangon coordinates if location access denied
          setMapCenter({ lat: 16.8409, lng: 96.1735 })
        }
      )
    }
  }, [])

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter(location)
          setIsGettingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsGettingLocation(false)
        }
      )
    }
  }

  const handleCreatePin = () => {
    if (!pinTitle || !pinDescription) return

    const newPin: Pin = {
      id: Date.now().toString(),
      type: pinType,
      status: user?.role === 'tracking_volunteer' ? 'confirmed' : 'pending',
      title: pinTitle,
      description: pinDescription,
      lat: mapCenter.lat + (Math.random() - 0.5) * 0.01,
      lng: mapCenter.lng + (Math.random() - 0.5) * 0.01,
      createdBy: user?.name || 'Anonymous User',
      createdAt: new Date(),
      image: pinImage ? URL.createObjectURL(pinImage) : undefined
    }

    setPins([newPin, ...pins])
    setPinTitle('')
    setPinDescription('')
    setPinImage(null)
    setShowPinDialog(false)
  }

  const handleConfirmPin = (pinId: string) => {
    setPins(pins.map(pin => 
      pin.id === pinId ? { ...pin, status: 'confirmed' } : pin
    ))
  }

  const handleDenyPin = (pinId: string) => {
    setPins(pins.filter(pin => pin.id !== pinId))
  }

  const handleMarkCompleted = (pinId: string) => {
    setPins(pins.map(pin => 
      pin.id === pinId ? { ...pin, status: 'completed' } : pin
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />
      case 'confirmed': return <Check className="w-3 h-3" />
      case 'completed': return <Shield className="w-3 h-3" />
      default: return null
    }
  }

  const filteredPins = pins.filter(pin => {
    if (user?.role === 'supply_volunteer') {
      return pin.status === 'confirmed' && pin.type === 'damaged'
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('map.title')}</h1>
              <p className="text-gray-600">{t('map.subtitle')}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                {t('map.currentLocation')}
              </Button>
              
              <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {t('map.addPin')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('map.addPin')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t('map.damagedLocation')} / {t('map.safeZone')}</Label>
                      <Select value={pinType} onValueChange={(value: 'damaged' | 'safe') => setPinType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="damaged">{t('map.damagedLocation')}</SelectItem>
                          <SelectItem value="safe">{t('map.safeZone')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="pin-title">Title</Label>
                      <Input
                        id="pin-title"
                        value={pinTitle}
                        onChange={(e) => setPinTitle(e.target.value)}
                        placeholder="Enter title..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="pin-description">{t('map.description')}</Label>
                      <Textarea
                        id="pin-description"
                        value={pinDescription}
                        onChange={(e) => setPinDescription(e.target.value)}
                        placeholder="Describe the situation..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="pin-image">{t('map.uploadImage')}</Label>
                      <Input
                        id="pin-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPinImage(e.target.files?.[0] || null)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleCreatePin} className="flex-1">
                        {t('map.submit')}
                      </Button>
                      <Button variant="outline" onClick={() => setShowPinDialog(false)}>
                        {t('map.cancel')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                {/* Simple Map Placeholder */}
                <div className="relative h-full bg-gray-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                    {/* Map Grid */}
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(10)].map((_, i) => (
                        <div key={`h-${i}`} className="absolute w-full border-b border-gray-400" style={{ top: `${i * 10}%` }} />
                      ))}
                      {[...Array(10)].map((_, i) => (
                        <div key={`v-${i}`} className="absolute h-full border-r border-gray-400" style={{ left: `${i * 10}%` }} />
                      ))}
                    </div>
                    
                    {/* User Location */}
                    {userLocation && (
                      <div 
                        className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg z-20"
                        style={{ 
                          left: '50%', 
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping" />
                      </div>
                    )}
                    
                    {/* Pins */}
                    {filteredPins.map((pin, index) => (
                      <div
                        key={pin.id}
                        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                        style={{ 
                          left: `${20 + (index * 25) % 60}%`, 
                          top: `${20 + (index * 30) % 60}%` 
                        }}
                        onClick={() => setSelectedPin(pin)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                          pin.type === 'damaged' ? 'bg-red-500' : 'bg-green-500'
                        }`}>
                          {pin.type === 'damaged' ? (
                            <AlertTriangle className="w-4 h-4 text-white" />
                          ) : (
                            <Shield className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${
                          pin.status === 'pending' ? 'bg-yellow-400' :
                          pin.status === 'confirmed' ? 'bg-green-400' : 'bg-blue-400'
                        }`} />
                      </div>
                    ))}
                  </div>
                  
                  {/* Map Legend */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                    <h3 className="text-sm font-semibold mb-2">Legend</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                        <span>{t('map.damagedLocation')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 bg-green-500 rounded-full" />
                        <span>{t('map.safeZone')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                        <span>{t('map.pending')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                        <span>{t('map.confirmed')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-blue-400 rounded-full" />
                        <span>{t('map.completed')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {pins.filter(p => p.type === 'damaged').length}
                    </div>
                    <div className="text-sm text-gray-600">Damaged Areas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {pins.filter(p => p.type === 'safe').length}
                    </div>
                    <div className="text-sm text-gray-600">Safe Zones</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Pins */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredPins.slice(0, 5).map((pin) => (
                    <div
                      key={pin.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedPin(pin)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {pin.type === 'damaged' ? (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Shield className="w-4 h-4 text-green-500" />
                            )}
                            <span className="font-medium text-sm">{pin.title}</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{pin.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`text-xs ${getStatusColor(pin.status)}`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(pin.status)}
                                <span>{t(`map.${pin.status}`)}</span>
                              </div>
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {pin.createdAt.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons for volunteers */}
                      {user?.role === 'tracking_volunteer' && pin.status === 'pending' && (
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" onClick={() => handleConfirmPin(pin.id)} className="flex-1">
                            <Check className="w-3 h-3 mr-1" />
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDenyPin(pin.id)} className="flex-1">
                            <X className="w-3 h-3 mr-1" />
                            Deny
                          </Button>
                        </div>
                      )}
                      
                      {user?.role === 'supply_volunteer' && pin.status === 'confirmed' && pin.type === 'damaged' && (
                        <Button size="sm" onClick={() => handleMarkCompleted(pin.id)} className="w-full mt-2">
                          <Check className="w-3 h-3 mr-1" />
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Kit Reminder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Emergency Kit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Remember to check your emergency kit regularly. Ensure you have water, food, flashlight, and first aid supplies.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pin Detail Dialog */}
      {selectedPin && (
        <Dialog open={!!selectedPin} onOpenChange={() => setSelectedPin(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedPin.type === 'damaged' ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : (
                  <Shield className="w-5 h-5 text-green-500" />
                )}
                {selectedPin.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Badge className={`${getStatusColor(selectedPin.status)}`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedPin.status)}
                    <span>{t(`map.${selectedPin.status}`)}</span>
                  </div>
                </Badge>
              </div>
              
              <p className="text-gray-700">{selectedPin.description}</p>
              
              {selectedPin.image && (
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={selectedPin.image} 
                    alt={selectedPin.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="text-sm text-gray-500 space-y-1">
                <div>Reported by: {selectedPin.createdBy}</div>
                <div>Time: {selectedPin.createdAt.toLocaleString()}</div>
                {selectedPin.assignedTo && (
                  <div>Assigned to: {selectedPin.assignedTo}</div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                {user?.role === 'tracking_volunteer' && selectedPin.status === 'pending' && (
                  <>
                    <Button onClick={() => handleConfirmPin(selectedPin.id)} className="flex-1">
                      <Check className="w-4 h-4 mr-2" />
                      Confirm
                    </Button>
                    <Button variant="outline" onClick={() => handleDenyPin(selectedPin.id)} className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Deny
                    </Button>
                  </>
                )}
                
                {user?.role === 'supply_volunteer' && selectedPin.status === 'confirmed' && selectedPin.type === 'damaged' && (
                  <Button onClick={() => handleMarkCompleted(selectedPin.id)} className="w-full">
                    <Check className="w-4 h-4 mr-2" />
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}