'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Shield, 
  Heart, 
  Navigation,
  MapPin,
  Clock,
  Bell
} from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import Link from 'next/link'

interface AlertItem {
  id: string
  type: 'earthquake' | 'safety' | 'family' | 'emergency'
  title: string
  description: string
  timestamp: Date
  severity: 'high' | 'medium' | 'low'
  location?: string
  actionUrl?: string
  actionLabel?: string
}

const mockAlerts: AlertItem[] = [
  {
    id: '1',
    type: 'earthquake',
    title: 'Earthquake Alert',
    description: 'Magnitude 4.5 detected near Yangon',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'high',
    location: 'Yangon, Myanmar',
    actionUrl: '/',
    actionLabel: 'View on Map'
  },
  {
    id: '2',
    type: 'safety',
    title: 'Safety Reminder',
    description: 'Check your emergency kit supplies',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    severity: 'medium',
    actionLabel: 'Check Kit'
  },
  {
    id: '3',
    type: 'family',
    title: 'Family Update',
    description: 'Family member marked as safe',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    severity: 'low'
  },
  {
    id: '4',
    type: 'emergency',
    title: 'Emergency Shelter Available',
    description: 'New emergency shelter opened at Central School',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    severity: 'high',
    location: 'Central School, Yangon',
    actionUrl: '/',
    actionLabel: 'View Location'
  },
  {
    id: '5',
    type: 'safety',
    title: 'Weather Alert',
    description: 'Heavy rain expected in the next 24 hours',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    severity: 'medium'
  }
]

export default function AlertsPage() {
  const { t } = useLanguage()
  const [alerts] = useState<AlertItem[]>(mockAlerts)

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'earthquake':
        return <AlertTriangle className="h-4 w-4" />
      case 'safety':
        return <Shield className="h-4 w-4" />
      case 'family':
        return <Heart className="h-4 w-4" />
      case 'emergency':
        return <Bell className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    } else {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    }
  }

  const highSeverityAlerts = alerts.filter(a => a.severity === 'high')
  const mediumSeverityAlerts = alerts.filter(a => a.severity === 'medium')
  const lowSeverityAlerts = alerts.filter(a => a.severity === 'low')

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recent Alerts
          </h1>
          <p className="text-gray-600">
            Stay informed about earthquake alerts, safety updates, and emergency information
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{highSeverityAlerts.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Medium Priority</p>
                  <p className="text-2xl font-bold text-yellow-600">{mediumSeverityAlerts.length}</p>
                </div>
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              All Alerts
            </CardTitle>
            <CardDescription>
              Latest earthquake alerts and safety notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className={`border-l-4 ${getSeverityColor(alert.severity).split(' ')[0]} ${getSeverityColor(alert.severity).split(' ')[1]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <strong className="text-base">{alert.title}</strong>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(alert.timestamp)}</span>
                            </div>
                            {alert.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{alert.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {alert.actionUrl && alert.actionLabel && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={alert.actionUrl}>
                              <Navigation className="w-3 h-3 mr-1" />
                              {alert.actionLabel}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>

            {alerts.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No alerts at this time</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

