// src/app/myorders/[orderId]/OrderDetailsPage.tsx
'use client';

import { use } from 'react';
import { useOrderDetails } from '@/hooks/useOrderDetails';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Loader2, AlertCircle, ArrowLeft, 
  Clock, MapPin, Phone, FileText 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params); // Resolve the Promise
  const router = useRouter();
  const { orderId } = resolvedParams;

  const { orderDetails, isLoading, error } = useOrderDetails(orderId);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-red-600">{error || 'Order not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { data: order } = orderDetails;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-amber-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Orders
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-gray-600 mt-1">
              Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Items */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × ৳{parseFloat(item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium text-amber-600">৳{parseFloat(item.subtotal).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span className="text-amber-600">৳{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Delivery Details */}
        <div className="space-y-6">
          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Information</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Delivery Address</p>
                  <p className="text-gray-900">{order.delivery_address}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Contact Number</p>
                  <p className="text-gray-900">{order.phone}</p>
                </div>
              </div>
              {order.special_instructions && (
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Special Instructions</p>
                    <p className="text-gray-900">{order.special_instructions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Timeline</h2>
            <div className="flex items-center text-sm">
              <Clock className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="font-medium text-gray-900">Order Placed</p>
                <p className="text-gray-600">{format(new Date(order.created_at), 'PPp')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
