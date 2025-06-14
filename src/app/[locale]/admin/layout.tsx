import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
} from '@clerk/nextjs';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className='flex justify-end items-center p-4 gap-4 h-16'>
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <div className='flex'>
        <aside className='w-64 h-screen bg-gray-100 p-4'>
          <h2 className='text-xl font-bold mb-4'>Admin Menu</h2>
          <nav>
            <ul>
              <li>
                <Link href='/admin/builder'>Builder</Link>
              </li>
            </ul>
          </nav>
        </aside>
        {children}
      </div>
    </>
  );
}
