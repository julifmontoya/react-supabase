import { useEffect, useState } from 'react';
import { getSessionToken } from '../utils/getSessionToken';

function Tickets() {

    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        const fetchDbTickets = async () => {
            try {
                const accessToken = await getSessionToken();

                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tickets`, {
                    headers: {
                        'Content-Type': 'application/json',
                        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) throw new Error(`DB fetch error: ${response.status}`);

                const ticketData = await response.json();
                setTickets(ticketData);
            } catch (error) {
                console.error('Error fetching DB tickets:', error.message);
                setTickets([]);
            }
        };

        fetchDbTickets();
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

/*
// Tickets.jsx
import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient'; // your existing Supabase client

function Tickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false }) // optional

      if (error) {
        console.error('Error fetching tickets:', error.message);
        setTickets([]);
        return;
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
*/
