import React from 'react';
import { useRequest, AsyncBoundary } from '@front-guard/react';
import { api } from './api';

type Todo = { id: number; title: string; completed: boolean };

export function App() {
  const { status, data, error, refetch } = useRequest<Todo>(
    api,
    '/todos/1',
    { enabled: true },
  );

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>front-guard demo</h1>
      <button onClick={() => refetch()}>Refetch</button>
      <AsyncBoundary
        state={{ status, data, error }}
        loading={<p>Loading…</p>}
        error={(e) => <p style={{ color: 'red' }}>Error: {e.message}</p>}
      >
        {(todo) => (
          <pre>{JSON.stringify(todo, null, 2)}</pre>
        )}
      </AsyncBoundary>
    </div>
  );
}
