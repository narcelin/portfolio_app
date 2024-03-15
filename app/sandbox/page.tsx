'use client';

import { useEffect, useState } from "react";
import { supabase } from "../lib/initSupabase";


export default function Page(){
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        const { data: users}  = await supabase.from('User').select('*');
        
            setUsers(users); //Works, ignore error
        };
        
        useEffect(()=>{
            fetchUsers();
        }, []);

    return ( 
        <main>
            <p>Sandbox Page</p>
            <ul>
                <li>USERS BELOW</li>
                {users.map((user)=> (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </main>

    );
}