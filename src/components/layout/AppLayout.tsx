import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
