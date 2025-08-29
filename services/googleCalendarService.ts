import { GOOGLE_CALENDAR_ENDPOINTS } from '../config/api';
import { getAccessToken } from './googleAuthService';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface CreateEventData {
  summary: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  attendees?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Get user's calendar list
export const getCalendarList = async () => {
  try {
    return await makeAuthenticatedRequest(GOOGLE_CALENDAR_ENDPOINTS.CALENDAR_LIST);
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    throw error;
  }
};

// Get events from primary calendar
export const getEvents = async (timeMin?: Date, timeMax?: Date) => {
  try {
    const params = new URLSearchParams();
    
    if (timeMin) {
      params.append('timeMin', timeMin.toISOString());
    }
    if (timeMax) {
      params.append('timeMax', timeMax.toISOString());
    }
    
    params.append('singleEvents', 'true');
    params.append('orderBy', 'startTime');

    const url = `${GOOGLE_CALENDAR_ENDPOINTS.EVENTS}?${params.toString()}`;
    return await makeAuthenticatedRequest(url);
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData: CreateEventData): Promise<GoogleCalendarEvent> => {
  try {
    const event: Partial<GoogleCalendarEvent> = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startDate.toISOString(),
      },
      end: {
        dateTime: eventData.endDate.toISOString(),
      },
      location: eventData.location,
      reminders: eventData.reminders || {
        useDefault: true,
      },
    };

    // Add attendees if provided
    if (eventData.attendees && eventData.attendees.length > 0) {
      event.attendees = eventData.attendees.map(email => ({ email }));
    }

    const response = await makeAuthenticatedRequest(GOOGLE_CALENDAR_ENDPOINTS.EVENTS, {
      method: 'POST',
      body: JSON.stringify(event),
    });

    return response;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId: string, eventData: Partial<CreateEventData>): Promise<GoogleCalendarEvent> => {
  try {
    const event: Partial<GoogleCalendarEvent> = {};

    if (eventData.summary) event.summary = eventData.summary;
    if (eventData.description) event.description = eventData.description;
    if (eventData.startDate) event.start = { dateTime: eventData.startDate.toISOString() };
    if (eventData.endDate) event.end = { dateTime: eventData.endDate.toISOString() };
    if (eventData.location) event.location = eventData.location;
    if (eventData.reminders) event.reminders = eventData.reminders;

    const url = `${GOOGLE_CALENDAR_ENDPOINTS.EVENTS}/${eventId}`;
    const response = await makeAuthenticatedRequest(url, {
      method: 'PUT',
      body: JSON.stringify(event),
    });

    return response;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const url = `${GOOGLE_CALENDAR_ENDPOINTS.EVENTS}/${eventId}`;
    await makeAuthenticatedRequest(url, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Sync app events to Google Calendar
export const syncEventsToGoogleCalendar = async (events: any[]) => {
  try {
    const results = [];
    
    for (const event of events) {
      try {
        const googleEvent = await createEvent({
          summary: event.title,
          description: event.description,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          location: event.location,
        });
        
        results.push({
          success: true,
          appEventId: event.id,
          googleEventId: googleEvent.id,
        });
      } catch (error) {
        results.push({
          success: false,
          appEventId: event.id,
          error: error.message,
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error syncing events to Google Calendar:', error);
    throw error;
  }
};

// Convert todo to Google Calendar event
export const createTodoAsEvent = async (todo: any): Promise<GoogleCalendarEvent> => {
  try {
    const startDate = todo.dueDate ? new Date(todo.dueDate) : new Date();
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const eventData: CreateEventData = {
      summary: todo.text,
      description: todo.notes,
      startDate,
      endDate,
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: 'popup',
            minutes: todo.earlyReminder ? getReminderMinutes(todo.earlyReminder) : 15,
          },
        ],
      },
    };

    return await createEvent(eventData);
  } catch (error) {
    console.error('Error creating todo as event:', error);
    throw error;
  }
};

// Helper function to convert early reminder string to minutes
const getReminderMinutes = (earlyReminder: string): number => {
  switch (earlyReminder) {
    case '5 minutes before':
      return 5;
    case '15 minutes before':
      return 15;
    case '1 hour before':
      return 60;
    case '1 day before':
      return 24 * 60;
    default:
      return 15;
  }
};
