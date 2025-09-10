import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'responses.json');

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Read existing responses
    let responses = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      responses = JSON.parse(fileData);
    }

    // Append new data
    responses.push(data);

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(responses, null, 2));

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
