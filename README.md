# 🧠 Supabase Tutorial – Noob to Pro

🗂️ .env file (Vite)
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

📦 utils/supabaseClient.js
```
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
```

🔐 utils/getSessionToken.js
```
import supabase from './supabaseClient';

export const getSessionToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    console.error('Session error:', error);
    return null;
  }
  return session.access_token;
};
```

## Option 1: Supabase Client – Auto Token Handling
✅ Automatically handles session token + refresh.
❌ Not great for admin/server-side filters (because it uses the current user's role only).
```
import { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient';

function Tickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error.message);
        return setTickets([]);
      }

      setTickets(data);
    };

    fetchTickets();
  }, []);

  return (
    <div>
      <h2>Tickets</h2>
      <ul>
        {tickets.map(ticket => (
          <li key={ticket.id}>{ticket.subject || 'No subject'}</li>
        ))}
      </ul>
    </div>
  );
}

export default Tickets;
```

## Option 2: Manual REST Fetch (with access token)
```
import { useEffect, useState } from 'react';
import { getSessionToken } from '../utils/getSessionToken';

function Tickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = await getSessionToken();

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tickets`, {
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`DB fetch error: ${response.status}`);
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error('Fetch error:', error.message);
        setTickets([]);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div>
      <h2>Tickets</h2>
      <ul>
        {tickets.map(ticket => (
          <li key={ticket.id}>{ticket.subject || 'No subject'}</li>
        ))}
      </ul>
    </div>
  );
}

export default Tickets;
```

# 🔐 Step-by-Step: Create and Use Roles in Supabase

## 1. Create Custom Role (optional, for Postgres permissions)
You don't need to create a DB role unless you're using fine-grained PostgreSQL permissions.
Supabase access is controlled via RLS + app_metadata.role.

```
CREATE ROLE admin_user;
```

##  🔐 2. Enable RLS and Policies on tickets Table
Policy 1: Admin can view all
```
CREATE POLICY "Admins can view all tickets"
ON tickets
FOR SELECT
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin_user');
```

Policy 2: Regular users can view own
```
CREATE POLICY "Users can view their own tickets"
ON tickets
FOR SELECT
USING (user_id = auth.uid());
```

# 👤 Assign Role to Supabase User

## 1. Backend Admin Client (utils/supabaseAdmin.ts)
```
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Secret! Never use on frontend
);

export default supabaseAdmin;
```

## 2. Update user role (admin backend or script)
```
import supabaseAdmin from '../utils/supabaseAdmin';

export async function setUserRole(userId: string, role: string) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  });

  if (error) throw error;
  return data;
}
```

# 🧪 Postman: Manually Assign Role to a User

## 1. Get Service Role Key
Go to Supabase Dashboard → Project Settings → API → Copy service_role

## 2. Get Service Role Key
Supabase → Auth → Users → Copy the user ID (UUID)

## 3. Send Request in Postman
```
https://<project-ref>.supabase.co/auth/v1/admin/users/<USER_ID>
```

- Method: PUT
- Headers:
```
apikey: <your_service_role>
Authorization: Bearer <your_service_role>
Content-Type: application/json
```