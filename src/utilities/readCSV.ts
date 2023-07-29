import fs from 'fs';
import csvParser from 'csv-parser'

// Function to read and parse CSV data using streams
export default function readCSV(filePath: string, league_id?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const data: any[] = [];
    
        fs.createReadStream(filePath)
          .pipe(
            csvParser({
              mapHeaders: ({ header }): string | null => {
                // Add logic to filter columns if needed
                if (header === 'league_id' && league_id) {
                  // If league_id is provided, only parse rows with the matching league_id
                  return header === 'league_id' ? 'league_id' : null;
                }
                // By default, parse all columns
                return header;
              },
            })
          )
          .on('data', (row: any) => {
            // Add additional filtering logic if needed
            if (!league_id || row.league_id === league_id) {
              data.push(row);
            }
          })
          .on('end', () => {
            resolve(data);
          })
          .on('error', (error: any) => {
            reject(error);
          });
      });
    }