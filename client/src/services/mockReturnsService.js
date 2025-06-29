// Mock service for returns data
// This simulates API responses during development

const mockReturns = [
  {
    return_id: 1001,
    order_id: 5001,
    customer_name: "John Smith",
    request_date: "2023-10-10T15:30:00Z",
    status: "PENDING",
    total_refund_amount: 129.99,
    total_items: 2,
    reason: "Defective product",
    notes: "Customer reported item was not working properly"
  },
  {
    return_id: 1002,
    order_id: 5023,
    customer_name: "Emily Johnson",
    request_date: "2023-10-08T12:15:00Z",
    status: "APPROVED",
    total_refund_amount: 75.50,
    total_items: 1,
    reason: "Wrong item received",
    notes: "Customer received different color than ordered"
  },
  {
    return_id: 1003,
    order_id: 4987,
    customer_name: "Robert Williams",
    request_date: "2023-10-05T09:45:00Z",
    status: "COMPLETED",
    total_refund_amount: 240.00,
    total_items: 3,
    reason: "Changed mind",
    notes: "Customer no longer needs the items"
  },
  {
    return_id: 1004,
    order_id: 5042,
    customer_name: "Sarah Davis",
    request_date: "2023-10-02T14:20:00Z",
    status: "REJECTED",
    total_refund_amount: 199.99,
    total_items: 1,
    reason: "Item damaged",
    notes: "Damage appears to be caused by customer after delivery"
  },
  {
    return_id: 1005,
    order_id: 5078,
    customer_name: "Michael Brown",
    request_date: "2023-10-01T10:30:00Z",
    status: "PENDING",
    total_refund_amount: 45.25,
    total_items: 1,
    reason: "Better price found elsewhere",
    notes: "Customer requesting price match"
  }
];

const mockStatistics = {
  total_returns: 27,
  total_refund_amount: 3245.75,
  status_distribution: [
    { status: "PENDING", count: 8 },
    { status: "APPROVED", count: 7 },
    { status: "COMPLETED", count: 9 },
    { status: "REJECTED", count: 3 }
  ],
  top_return_reasons: [
    { reason: "Defective product", count: 10 },
    { reason: "Changed mind", count: 8 },
    { reason: "Wrong item received", count: 5 },
    { reason: "Other", count: 4 }
  ]
};

export const getReturns = async (params = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredReturns = [...mockReturns];
  
  // Apply filters if provided
  if (params.status) {
    filteredReturns = filteredReturns.filter(r => r.status === params.status);
  }
  
  // Apply date range if provided
  if (params.startDate && params.endDate) {
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    filteredReturns = filteredReturns.filter(r => {
      const returnDate = new Date(r.request_date);
      return returnDate >= startDate && returnDate <= endDate;
    });
  }
  
  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedReturns = filteredReturns.slice(startIndex, endIndex);
  
  // Return formatted response
  return {
    data: {
      data: paginatedReturns,
      pagination: {
        total: filteredReturns.length,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(filteredReturns.length / limit)
      }
    }
  };
};

export const getReturnStatistics = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    data: {
      data: mockStatistics
    }
  };
};

export default {
  getReturns,
  getReturnStatistics
}; 