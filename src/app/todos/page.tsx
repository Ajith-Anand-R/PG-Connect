import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Todos Connection Test</h1>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {todos?.map((todo) => (
          <li key={todo.id} className="py-2.5 flex justify-between">
            <span>{todo.name}</span>
          </li>
        ))}
        {(!todos || todos.length === 0) && (
          <p className="text-sm text-slate-500">No todos found. If connection is successful, make sure the table has data.</p>
        )}
      </ul>
    </div>
  )
}
