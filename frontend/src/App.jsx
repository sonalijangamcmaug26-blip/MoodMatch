import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Favourites from './pages/Favourites';
import Home from './pages/Home';
import ItemDetails from './pages/ItemDetails';
import Login from './pages/Login';
import MoodHistory from './pages/MoodHistory';
import MoodSelection from './pages/MoodSelection';
import NotFound from './pages/NotFound';
import Recommendations from './pages/Recommendations';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages that need a logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="/moods" element={<MoodSelection />} />
          <Route path="/recommendations/:moodId" element={<Recommendations />} />
          <Route path="/books/:id" element={<ItemDetails type="book" />} />
          <Route path="/movies/:id" element={<ItemDetails type="movie" />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/history" element={<MoodHistory />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
