import fs from 'fs';
import csvParser from 'csv-parser'

// Function to read and parse CSV data using streams
export default function readCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const data: any[] = [];
  
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row: any) => {
          data.push(row);
        })
        .on('end', () => {
          resolve(data);
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
  }