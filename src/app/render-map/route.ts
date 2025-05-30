// src/app/render-map/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Assuming map.html is in the root of your project
    const filePath = path.join(process.cwd(), 'map.html');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return new NextResponse(fileContents, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error("Error reading map.html:", error);
    // Return a simple error message or a more styled HTML error page
    return new NextResponse('<h1>Error loading map</h1><p>Could not load map.html. Please check server logs.</p>', {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}
