import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Escrow from "@/pages/Escrow";
import VehicleDetail from "@/pages/VehicleDetail";
import TransactionTracking from "@/pages/TransactionTracking";
import SellerAction from "@/pages/SellerAction";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminVehicles from "@/pages/admin/Vehicles";
import VehicleForm from "@/pages/admin/VehicleForm";
import AdminTransactions from "@/pages/admin/Transactions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
