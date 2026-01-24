'use server';

import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken, setSession, clearSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    await connectDB();

    const identifier = formData.get('identifier') as string; // username or email
    const password = formData.get('password') as string;

    if (!identifier || !password) {
        return { error: 'Please provide both identifier and password' };
    }

    try {
        // Check if user exists by username or email
        const user = await User.findOne({
            $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
        }).select('+password');

        if (!user) {
            return { error: 'Invalid credentials' };
        }

        const isMatch = await bcrypt.compare(password, user.password!);

        if (!isMatch) {
            return { error: 'Invalid credentials' };
        }

        // Create session
        const token = await signToken({ userId: user._id, username: user.username });
        await setSession(token);

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Something went wrong. Please try again.' };
    }

    redirect('/dashboard');
}

export async function logout() {
    await clearSession();
    redirect('/login');
}

export async function hasUsers() {
    await connectDB();
    const count = await User.countDocuments();
    return count > 0;
}

export async function createFirstUser(prevState: any, formData: FormData) {
    await connectDB();
    const count = await User.countDocuments();

    if (count > 0) {
        return { error: 'Admin already exists. Please login.' };
    }

    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!username || !email || !password) {
        return { error: 'All fields are required' };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            email,
            password: hashedPassword,
        });

        // Auto login
        const user = await User.findOne({ username });
        const token = await signToken({ userId: user?._id, username: user?.username });
        await setSession(token);

    } catch (error) {
        return { error: 'Failed to create admin.' };
    }

    redirect('/dashboard');
}

export async function createOtherUser(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    await connectDB();

    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!username || !email || !password) {
        return { error: 'All fields are required' };
    }

    try {
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username }],
        });

        if (existingUser) {
            return { error: 'User with this email or username already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return { success: 'User created successfully' };
    } catch (error) {
        console.error('Create user error:', error);
        return { error: 'Failed to create user' };
    }
}
