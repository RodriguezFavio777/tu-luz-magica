
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' }); // Load .env.local

async function testCalendarConnection() {
    try {
        console.log('Testing Google Calendar Connection...');

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
            throw new Error('Missing Google Credentials in .env.local');
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const response = await calendar.events.list({
            calendarId: 'primary',
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items;
        if (events.length) {
            console.log(`✅ Success! Found ${events.length} upcoming events.`);
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start}: ${event.summary}`);
            });
        } else {
            console.log('✅ Success! Connected, but no upcoming events found.');
        }

    } catch (error) {
        console.error('❌ Error connecting to Google Calendar:', error.message);
        if (error.response) {
            console.error('API Error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCalendarConnection();
