import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Toast from './components/Toast/Toast';
import HomePage from './pages/Home/HomePage';
import DestinationsPage from './pages/Destinations/DestinationsPage';
import CruiseDetailPage from './pages/CruiseDetail/CruiseDetailPage';
import SearchResultsPage from './pages/SearchResults/SearchResultsPage';
import CabinSelectionPage from './pages/Booking/CabinSelectionPage';
import GuestDetailsPage from './pages/Booking/GuestDetailsPage';
import ConfirmationPage from './pages/Booking/ConfirmationPage';
import PaymentPage from './pages/Booking/PaymentPage';
import EscobarFleetPage from './pages/EscobarFleet/EscobarFleetPage';
import WishlistPage from './pages/Wishlist/WishlistPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/"                   element={<HomePage />} />
          <Route path="/destinations"       element={<DestinationsPage />} />
          <Route path="/cruise/:id"         element={<CruiseDetailPage />} />
          <Route path="/search"             element={<SearchResultsPage />} />
          <Route path="/booking/cabin"      element={<CabinSelectionPage />} />
          <Route path="/booking/guests"     element={<GuestDetailsPage />} />
          <Route path="/booking/payment"    element={<PaymentPage />} />
          <Route path="/booking/confirm"    element={<ConfirmationPage />} />
          <Route path="/escobar-fleet"      element={<EscobarFleetPage />} />
          <Route path="/wishlist"           element={<WishlistPage />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
    </BrowserRouter>
  );
}
