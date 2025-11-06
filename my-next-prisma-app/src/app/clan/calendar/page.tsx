'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Users, Clock, MapPin, Bell, CheckCircle, XCircle } from 'lucide-react';

interface ClanEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  duration: number; // minutes
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  eventType: 'tournament' | 'practice' | 'social' | 'meeting';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  rsvpList: RSVP[];
}

interface RSVP {
  userId: string;
  userName: string;
  status: 'going' | 'maybe' | 'not-going';
  respondedAt: Date;
}

interface Clan {
  id: string;
  name: string;
  role: 'LEADER' | 'ELDER' | 'MEMBER';
}

export default function ClanCalendarPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [clan, setClan] = useState<Clan | null>(null);
  const [events, setEvents] = useState<ClanEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    maxParticipants: 10,
    eventType: 'practice' as const
  });

  useEffect(() => {
    if (user) {
      loadClanData();
    }
  }, [user]);

  const loadClanData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's clan
      const clanResponse = await fetch('/api/user/clan');
      if (clanResponse.ok) {
        const clanData = await clanResponse.json();
        setClan(clanData);
      }

      // Fetch clan events
      const eventsResponse = await fetch('/api/clan/events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        })));
      }
    } catch (error) {
      console.error('Error loading clan data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const response = await fetch('/api/clan/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        const createdEvent = await response.json();
        setEvents(prev => [...prev, { ...createdEvent, date: new Date(createdEvent.date) }]);
        setIsCreateDialogOpen(false);
        setNewEvent({
          title: '',
          description: '',
          date: '',
          time: '',
          duration: 60,
          location: '',
          maxParticipants: 10,
          eventType: 'practice'
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleRSVP = async (eventId: string, status: 'going' | 'maybe' | 'not-going') => {
    try {
      const response = await fetch(`/api/clan/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state
        setEvents(prev => prev.map(event => {
          if (event.id === eventId) {
            const updatedRsvpList = event.rsvpList.filter(rsvp => rsvp.userId !== user?.id);
            updatedRsvpList.push({
              userId: user?.id || '',
              userName: user?.name || '',
              status,
              respondedAt: new Date()
            });
            return {
              ...event,
              rsvpList: updatedRsvpList,
              currentParticipants: status === 'going' ? event.currentParticipants + 1 : event.currentParticipants
            };
          }
          return event;
        }));
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tournament':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'practice':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'social':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'meeting':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getUserRSVP = (event: ClanEvent) => {
    return event.rsvpList.find(rsvp => rsvp.userId === user?.id);
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Clan Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to be a member of a clan to view the calendar.
            </p>
            <Button>Join a Clan</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Clan Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {clan.name} - {clan.role}
        </p>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setSelectedDate(newDate);
            }}
          >
            ← Previous
          </Button>
          <h2 className="text-xl font-semibold">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setSelectedDate(newDate);
            }}
          >
            Next →
          </Button>
        </div>

        {(clan.role === 'LEADER' || clan.role === 'ELDER') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Schedule a new event for your clan members.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Event Description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  />
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max Participants"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                  />
                </div>
                <Input
                  placeholder="Location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                />
                <Select
                  value={newEvent.eventType}
                  onValueChange={(value) => setNewEvent(prev => ({ ...prev, eventType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateEvent} className="w-full">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-32 border border-gray-200 dark:border-gray-700" />;
              }

              const dayEvents = getEventsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`h-32 border border-gray-200 dark:border-gray-700 p-2 ${
                    isToday ? 'bg-blue-50 dark:bg-blue-950' : ''
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer ${getEventTypeColor(event.eventType)}`}
                        onClick={() => {
                          // Open event details modal
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events
            .filter(event => event.date > new Date() && event.status === 'upcoming')
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 6)
            .map(event => {
              const userRSVP = getUserRSVP(event);
              
              return (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={getEventTypeColor(event.eventType)}>
                        {event.eventType}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        {event.currentParticipants}/{event.maxParticipants}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {event.date.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {event.time} ({event.duration} min)
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </div>

                    {/* RSVP Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={userRSVP?.status === 'going' ? 'default' : 'outline'}
                        onClick={() => handleRSVP(event.id, 'going')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Going
                      </Button>
                      <Button
                        size="sm"
                        variant={userRSVP?.status === 'maybe' ? 'default' : 'outline'}
                        onClick={() => handleRSVP(event.id, 'maybe')}
                      >
                        Maybe
                      </Button>
                      <Button
                        size="sm"
                        variant={userRSVP?.status === 'not-going' ? 'default' : 'outline'}
                        onClick={() => handleRSVP(event.id, 'not-going')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Can't Go
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
} 