'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Search,
  Filter,
  Star,
  X,
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: string;
  isActive: boolean;
  images: string[];
  category?: string;
}

const mockServices: Service[] = [
  {
    id: '1',
    title: 'Pipe Repair',
    description: 'Fix leaky pipes and faucets',
    price: 150,
    priceType: 'FIXED',
    isActive: true,
    images: [],
    category: 'Plumbing',
  },
  {
    id: '2',
    title: 'Drain Cleaning',
    description: 'Professional drain cleaning service',
    price: 120,
    priceType: 'FIXED',
    isActive: true,
    images: [],
    category: 'Plumbing',
  },
  {
    id: '3',
    title: 'Water Heater Installation',
    description: 'Install new water heater',
    price: 500,
    priceType: 'FIXED',
    isActive: false,
    images: [],
    category: 'Plumbing',
  },
];

export default function DashboardServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'FIXED',
  });

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && service.isActive) ||
      (filterStatus === 'inactive' && !service.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleAddService = () => {
    if (!newService.title || !newService.price) return;

    const service: Service = {
      id: `s${Date.now()}`,
      title: newService.title,
      description: newService.description,
      price: parseFloat(newService.price),
      priceType: newService.priceType,
      isActive: true,
      images: [],
      category: user?.businessProfile?.category,
    };

    setServices([service, ...services]);
    setNewService({ title: '', description: '', price: '', priceType: 'FIXED' });
    setShowAddModal(false);
  };

  const toggleServiceStatus = (id: string) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const deleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Services</h1>
              <p className="text-muted-foreground">
                Manage your service listings
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl shadow-sm border p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-card rounded-xl shadow-sm border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{service.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          service.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">
                        {formatCurrency(service.price)}
                      </span>
                      <span className="text-muted-foreground">
                        {service.priceType}
                      </span>
                      {service.category && (
                        <span className="text-muted-foreground">
                          {service.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleServiceStatus(service.id)}
                      title={service.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {service.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteService(service.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredServices.length === 0 && (
              <div className="bg-card rounded-xl shadow-sm border p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No services found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterStatus !== 'all'
                    ? 'No services match your filters'
                    : 'Get started by adding your first service'}
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add New Service</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) =>
                    setNewService({ ...newService, title: e.target.value })
                  }
                  placeholder="e.g., Pipe Repair"
                  className="w-full px-3 py-2 rounded-lg border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your service..."
                  className="w-full px-3 py-2 rounded-lg border bg-background min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({ ...newService, price: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price Type
                  </label>
                  <select
                    value={newService.priceType}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        priceType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  >
                    <option value="FIXED">Fixed Price</option>
                    <option value="HOURLY">Hourly Rate</option>
                    <option value="STARTING_AT">Starting At</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddService}
                disabled={!newService.title || !newService.price}
              >
                Add Service
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
