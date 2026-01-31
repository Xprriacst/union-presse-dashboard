import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export async function getGoogleSheetsClient() {
  const credentials = process.env.GOOGLE_CREDENTIALS;

  if (!credentials) {
    throw new Error('GOOGLE_CREDENTIALS not set');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: SCOPES,
  });

  return google.sheets({ version: 'v4', auth });
}

export async function getSheetData(sheetName: string): Promise<string[][]> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID not set');
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  return response.data.values || [];
}

// Convert sheet rows to objects using first row as headers
export function rowsToObjects<T>(rows: string[][]): T[] {
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj as T;
  });
}
