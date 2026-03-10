
import { google } from 'googleapis';

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

function getOAuthClient() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
        throw new Error('Google Calendar credentials not set in .env');
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    return oauth2Client;
}

function getCalendar() {
    const auth = getOAuthClient();
    return google.calendar({ version: 'v3', auth });
}

export async function getCalendarEvents(startTime: string, endTime: string) {
    try {
        const calendar = getCalendar();
        const response = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: startTime,
            timeMax: endTime,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return response.data.items || [];
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        return [];
    }
}

export async function createCalendarEvent(
    summary: string,
    description: string,
    startDateTime: string,
    endDateTime: string,
    attendees: { email: string }[] = [],
    transparency: 'opaque' | 'transparent' = 'opaque'
) {
    try {
        const calendar = getCalendar();
        const event = {
            summary,
            description,
            transparency,
            start: {
                dateTime: startDateTime,
                timeZone: 'America/Argentina/Buenos_Aires', // Adjust as needed
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'America/Argentina/Buenos_Aires', // Adjust as needed
            },
            attendees,
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            requestBody: event,
        });

        return response.data;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
}

export async function getFreeBusy(timeMin: string, timeMax: string) {
    try {
        const calendar = getCalendar();
        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin,
                timeMax,
                timeZone: 'America/Argentina/Buenos_Aires',
                items: [{ id: CALENDAR_ID }]
            }
        });
        return response.data.calendars?.[CALENDAR_ID]?.busy || [];
    } catch (error) {
        console.error('Error fetching free/busy:', error);
        return [];
    }
}
