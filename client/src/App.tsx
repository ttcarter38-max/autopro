import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Inventory from "@/pages/Inventory";
import Escrow from "@/pages/Escrow";
import VehicleDetail from "@/pages/VehicleDetail";
import TransactionTracking from "@/pages/TransactionTracking";
import SellerAction from "@/pages/SellerAction";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminVehicles from "@/pages/admin/Vehicles";
import VehicleForm from "@/pages/admin/VehicleForm";
import AdminTransactions from "@/pages/admin/Transactions";
import AdminTestimonials from "@/pages/admin/Testimonials";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MyTransactions from "@/pages/MyTransactions";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";
import { SiWhatsapp } from "react-icons/si";

// ── Change this to your real WhatsApp number (international format, no + or spaces) ──
const WHATSAPP_NUMBER = "1234567890";
const WHATSAPP_MESSAGE = "Hello! I'm interested in your vehicles.";

function WhatsAppButton() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      data-testid="button-whatsapp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
      style={{ backgroundColor: '#25D366' }}
    >
      <SiWhatsapp className="w-7 h-7 text-white" />
    </a>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/inventory" component={Inventory}/>
      <Route path="/escrow" component={Escrow}/>
      <Route path="/vehicle/:id" component={VehicleDetail}/>
      <Route path="/track/:idOrToken" component={TransactionTracking}/>
      <Route path="/seller/:token" component={SellerAction}/>
      <Route path="/admin/login" component={AdminLogin}/>
      <Route path="/admin/dashboard" component={AdminDashboard}/>
      <Route path="/admin/vehicles" component={AdminVehicles}/>
      <Route path="/admin/vehicles/new" component={VehicleForm}/>
      <Route path="/admin/vehicles/:id/edit" component={VehicleForm}/>
      <Route path="/admin/transactions" component={AdminTransactions}/>
      <Route path="/admin/testimonials" component={AdminTestimonials}/>
      <Route path="/contact" component={Contact}/>
      <Route path="/about" component={About}/>
      <Route path="/login" component={Login}/>
      <Route path="/register" component={Register}/>
      <Route path="/my-transactions" component={MyTransactions}/>
      <Route path="/privacy" component={Privacy}/>
      <Route path="/terms" component={Terms}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <WhatsAppButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
