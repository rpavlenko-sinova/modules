import { GoogleSpreadsheet } from 'google-spreadsheet'
import { getAccessToken } from '../googleAuth/fetchAuthFlow/getAccessToken'

export async function getSheet(sheetId: string) {
  try {
    const accessToken = await getAccessToken()
    const doc = new GoogleSpreadsheet(sheetId, { token: accessToken })
    await doc.loadInfo()

    let sheet = doc.sheetsByIndex[0]
    if (!sheet) {
      sheet = await doc.addSheet({ title: 'Sheet1' })
    }

    return sheet
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error)
    throw error
  }
}