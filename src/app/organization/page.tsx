'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  Check, 
  X, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Truck,
  Handshake,
  TrendingUp,
  Clock,
  Navigation,
  MessageCircle
} from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import { useAuth } from '@/hooks/use-auth'

interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  role: 'tracking_volunteer' | 'supply_volunteer'
  status: 'active' | 'inactive' | 'pending'
  location: string
  joinedAt: Date
  assignmentsCompleted: number
}

interface HelpRequest {
  id: string
  title: string
  description: string
  location: string
  urgency: 'low' | 'medium' | 'high'
  status: 'pending' | 'assigned' | 'completed'
  requestedBy: string
  requestedAt: Date
  assignedTo?: string
}

interface PartnerOrg {
  id: string
  name: string
  region: string
  activeCollaborations: number
  status: 'active' | 'inactive'
}

// Mock data
const mockVolunteers: Volunteer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+959123456789',
    role: 'tracking_volunteer',
    status: 'active',
    location: 'Yangon',
    joinedAt: new Date('2024-01-15'),
    assignmentsCompleted: 15
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+959987654321',
    role: 'supply_volunteer',
    status: 'active',
    location: 'Mandalay',
    joinedAt: new Date('2024-02-20'),
    assignmentsCompleted: 8
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+959456789123',
    role: 'tracking_volunteer',
    status: 'pending',
    location: 'Naypyidaw',
    joinedAt: new Date('2024-03-10'),
    assignmentsCompleted: 0
  }
]

const mockHelpRequests: HelpRequest[] = [
  {
    id: '1',
    title: 'Medical Supplies Needed',
    description: 'Urgent need for medical supplies at evacuation center',
    location: 'Yangon Downtown',
    urgency: 'high',
    status: 'pending',
    requestedBy: 'Hospital A',
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Food Distribution',
    description: 'Food supplies needed for 200+ displaced families',
    location: 'Mandalay District',
    urgency: 'medium',
    status: 'assigned',
    requestedBy: 'Shelter Manager',
    requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    assignedTo: 'Jane Doe'
  },
  {
    id: '3',
    title: 'Rescue Equipment',
    description: 'Heavy lifting equipment required for building collapse',
    location: 'Industrial Zone',
    urgency: 'high',
    status: 'completed',
    requestedBy: 'Fire Department',
    requestedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    assignedTo: 'John Smith'
  }
]

const mockPartnerOrgs: PartnerOrg[] = [
  {
    id: '1',
    name: 'Medical Response B',
    region: 'Mandalay',
    activeCollaborations: 3,
    status: 'active'
  },
  {
    id: '2',
    name: 'Supply Chain C',
    region: 'Naypyidaw',
    activeCollaborations: 2,
    status: 'active'
  }
]

export default function OrganizationPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers)
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>(mockHelpRequests)
  const [partnerOrgs, setPartnerOrgs] = useState<PartnerOrg[]>(mockPartnerOrgs)

  // Redirect non-organization users
  useEffect(() => {
    if (user && user.role !== 'organization') {
      window.location.href = '/'
    }
  }, [user])

  const handleApproveVolunteer = (volunteerId: string) => {
    setVolunteers(volunteers.map(v => 
      v.id === volunteerId ? { ...v, status: 'active' } : v
    ))
  }

  const handleRejectVolunteer = (volunteerId: string) => {
    setVolunteers(volunteers.map(v => 
      v.id === volunteerId ? { ...v, status: 'inactive' } : v
    ))
  }

  const handleAssignVolunteer = (requestId: string, volunteerId: string) => {
    const volunteer = volunteers.find(v => v.id === volunteerId)
    setHelpRequests(requests => requests.map(req => 
      req.id === requestId 
        ? { ...req, status: 'assigned', assignedTo: volunteer?.name }
        : req
    ))
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const activeVolunteers = volunteers.filter(v => v.status === 'active').length
  const pendingVolunteers = volunteers.filter(v => v.status === 'pending').length
  const pendingRequests = helpRequests.filter(r => r.status === 'pending').length
  const activeCollaborations = partnerOrgs.filter(o => o.status === 'active').length

  if (!user || user.role !== 'organization') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. Organization privileges required.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('org.title')}
          </h1>
          <p className="text-gray-600">Manage volunteers and coordinate relief efforts</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
                  <p className="text-2xl font-bold text-green-600">{activeVolunteers}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingVolunteers}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Help Requests</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingRequests}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Partnerships</p>
                  <p className="text-2xl font-bold text-purple-600">{activeCollaborations}</p>
                </div>
                <Handshake className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="volunteers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="volunteers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('org.volunteerManagement')}
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('org.helpRequests')}
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center gap-2">
              <Handshake className="w-4 h-4" />
              {t('org.collaboration')}
            </TabsTrigger>
          </TabsList>

          {/* Volunteer Management */}
          <TabsContent value="volunteers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  {t('org.volunteerManagement')}
                </CardTitle>
                <CardDescription>
                  Approve, manage, and assign volunteers to tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Assignments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteers.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{volunteer.name}</div>
                            <div className="text-sm text-gray-500">{volunteer.email}</div>
                            <div className="text-xs text-gray-400">{volunteer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={volunteer.role === 'tracking_volunteer' ? 'default' : 'secondary'}>
                            {volunteer.role === 'tracking_volunteer' ? 'Tracking' : 'Supply'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            {volunteer.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            {volunteer.assignmentsCompleted}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(volunteer.status)}>
                            {volunteer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {volunteer.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => handleApproveVolunteer(volunteer.id)}>
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleRejectVolunteer(volunteer.id)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              <MessageCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Help Requests */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  {t('org.helpRequests')}
                </CardTitle>
                <CardDescription>
                  Review and assign help requests to available volunteers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {helpRequests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{request.title}</h3>
                            <Badge className={getUrgencyColor(request.urgency)}>
                              {request.urgency}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {request.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {request.requestedAt.toLocaleString()}
                            </div>
                            <div>Requested by: {request.requestedBy}</div>
                            {request.assignedTo && (
                              <div>Assigned to: {request.assignedTo}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {request.status === 'pending' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <Users className="w-3 h-3 mr-1" />
                                  {t('org.assign')}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assign Volunteer</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2">
                                  {volunteers
                                    .filter(v => v.status === 'active' && v.role === 'supply_volunteer')
                                    .map((volunteer) => (
                                      <div
                                        key={volunteer.id}
                                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleAssignVolunteer(request.id, volunteer.id)}
                                      >
                                        <div className="font-medium">{volunteer.name}</div>
                                        <div className="text-sm text-gray-500">{volunteer.location}</div>
                                      </div>
                                    ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {request.status === 'assigned' && (
                            <Button size="sm" variant="outline">
                              <Navigation className="w-3 h-3 mr-1" />
                              Track
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collaboration */}
          <TabsContent value="collaboration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-purple-500" />
                  {t('org.collaboration')}
                </CardTitle>
                <CardDescription>
                  Partner with other organizations for large-scale disasters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnerOrgs.map((org) => (
                    <Card key={org.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{org.name}</h3>
                          <Badge className={getStatusColor(org.status)}>
                            {org.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {org.region}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {org.activeCollaborations} active collaborations
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          <Button size="sm">
                            <Handshake className="w-3 h-3 mr-1" />
                            Collaborate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Alert>
                    <Handshake className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Collaboration Mode Active</strong> - You can now share resources and coordinate with partner organizations for efficient disaster response.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}