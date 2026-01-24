'use client';

import { useActionState } from 'react';
import { createOtherUser } from '../actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const initialState: { error?: string, success?: string } = {
    error: '',
    success: '',
};

export default function AdminCreationForm() {
    const [state, formAction, isPending] = useActionState(createOtherUser, initialState);

    return (
        <form action={formAction} className="space-y-5">
            <Input
                name="username"
                label="Username"
                placeholder="newadmin"
                required
            />
            <Input
                name="email"
                type="email"
                label="Email Address"
                placeholder="newadmin@example.com"
                required
            />
            <Input
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                required
            />

            {state?.error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    {state.error}
                </div>
            )}

            {state?.success && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
                    {state.success}
                </div>
            )}

            <Button type="submit" variant="primary" className="w-full" isLoading={isPending}>
                Create Admin
            </Button>
        </form>
    );
}
