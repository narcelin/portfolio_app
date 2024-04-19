import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { supabase } from './app/lib/initSupabase';

async function getUser(email: string): Promise<User | undefined> {
    try {
        const userSB = await supabase.from('Users').select('*').eq('email', email);
        console.log("SUPABASE USER: ", userSB.data?.[0]);
        return userSB.data?.[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}


export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);
                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;
                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});

// Although we're using the Credentials provider, it's generally recommended to use alternative providers such as OAuth or email providers. See the NextAuth.js docs for a full list of options.