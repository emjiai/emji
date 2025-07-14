import { NextResponse } from "next/server";

// Environment variables
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';
const MONGODB_SYNC_ENDPOINT = `${BACKEND_API_URL}/api/users/sync-user`;

interface UserData {
  user_id: string;
  email: string;
  username?: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
}

export async function POST(req: Request) {
  try {
    // Get user data from request body
    const userData: UserData = await req.json();
    
    console.log('Received user data for MongoDB sync:', JSON.stringify(userData));
    
    // Forward to the MongoDB sync endpoint
    const response = await fetch(MONGODB_SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    console.log(`MongoDB sync response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error syncing to MongoDB:', errorText);
      return NextResponse.json(
        { error: 'Failed to sync user to MongoDB', details: errorText },
        { status: 500 }
      );
    }
    
    const result = await response.json();
    console.log('MongoDB sync successful:', JSON.stringify(result));
    
    return NextResponse.json(
      { success: true, message: 'User synced to MongoDB successfully', result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in MongoDB sync API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
