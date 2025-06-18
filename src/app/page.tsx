"use client";

import { useState } from 'react';
import { getUsers } from './actions';
import { User } from "@/db/entity/User";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (e) {
      setError("Failed to fetch users.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm lg:flex">
        <button 
          onClick={handleFetchUsers}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? 'Loading...' : 'Fetch All Users'}
        </button>
      </div>
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      <div className="mt-8">
        {users.length > 0 ? (
          <ul className="list-disc list-inside">
            {users.map((user) => (
              <li key={user.id}>{user.name} - {user.age} years old</li>
            ))}
          </ul>
        ) : (
          <p>No users to display. Click the button to fetch them.</p>
        )}
      </div>
    </main>
  );
}
