
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

console.log('--- DEBUG START ---');
console.log('CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'MISSING');
console.log('CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'MISSING');
console.log('REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? 'Set' : 'MISSING');

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

async function testFreeBusy() {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 86400000).toISOString(); // +24h

        console.log('Testing Free/Busy...');
        console.log('Min:', timeMin);
        console.log('Max:', timeMax);

        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin,
                timeMax,
                timeZone: 'America/Argentina/Buenos_Aires',
                items: [{ id: CALENDAR_ID }]
            }
        });

        console.log('SUCCESS! Free/Busy Data:');
        console.log(JSON.stringify(response.data.calendars[CALENDAR_ID].busy, null, 2));

    } catch (error) {
        console.error('ERROR FAILED:');
        console.error(error.message);
        if (error.response) {
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testFreeBusy();
