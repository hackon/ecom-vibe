// Mock CRM State
const crmData = {
  organizations: [
    {
      id: 'org-1',
      name: 'Oak & Iron Workshops',
      registrationNumber: '12345678',
      type: 'B2B',
      status: 'active'
    }
  ],
  customers: [
    {
      id: 'cust-1',
      orgId: 'org-1',
      name: 'John Doe',
      email: 'john@oakandiron.com',
      phone: '+1-555-0123',
      status: 'active',
      segment: 'Premium',
      assignedRep: 'Sarah Miller',
      notes: 'Prefers hardwood deliveries on Tuesday mornings.',
      erpAccountId: 'ERP-ACC-001'
    }
  ],
  contacts: [
    {
      id: 'cont-1',
      customerId: 'cust-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@oakandiron.com',
      jobTitle: 'Master Carpenter'
    }
  ],
  activities: [
    {
      id: 'act-1',
      customerId: 'cust-1',
      type: 'note',
      text: 'Customer interested in bulk walnut planks.',
      timestamp: '2026-01-14T10:00:00Z'
    }
  ]
};

export async function getOrganizations() {
  await new Promise(resolve => setTimeout(resolve, 60));
  return crmData.organizations;
}

export async function getCustomers() {
  await new Promise(resolve => setTimeout(resolve, 70));
  return crmData.customers;
}

export async function getCustomerById(id: string) {
  await new Promise(resolve => setTimeout(resolve, 50));
  return crmData.customers.find(c => c.id === id) || null;
}

export async function getCustomerTimeline(id: string) {
  await new Promise(resolve => setTimeout(resolve, 50));
  return crmData.activities.filter(a => a.customerId === id);
}

export async function createCustomer(data: Record<string, unknown>) {
  await new Promise(resolve => setTimeout(resolve, 150));
  const newCustomer = {
    ...data,
    id: `cust-${Math.random().toString(36).substr(2, 5)}`,
    status: 'onboarding'
  };
  (crmData.customers as unknown[]).push(newCustomer);
  return newCustomer;
}
