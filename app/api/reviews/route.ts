import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';

// GET all reviews
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const reviews = await Review.find({}).sort({ createdAt: -1 });
        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}
