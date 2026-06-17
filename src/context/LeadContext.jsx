import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const LeadContext = createContext();

const initialLeads = [
  {
    id: 'lead-1',
    name: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    email: 's.connor@cyberdyne.io',
    phone: '+1 (555) 019-2831',
    value: 48000,
    status: 'Meeting Scheduled',
    source: 'Website',
    owner: 'Sarah Chen',
    lastContacted: '2026-06-12T10:30:00Z',
    createdAt: '2026-05-15T09:00:00Z',
    notes: 'Very interested in our API integrations. Demanded high security standards.'
  },
  {
    id: 'lead-2',
    name: 'Miles Dyson',
    company: 'Neural Net Corp',
    email: 'm.dyson@neuralnet.com',
    phone: '+1 (555) 014-9988',
    value: 125000,
    status: 'Won',
    source: 'Referral',
    owner: 'Marcus Vance',
    lastContacted: '2026-06-14T15:20:00Z',
    createdAt: '2026-05-20T11:30:00Z',
    notes: 'Deal closed! Contract signed for enterprise-wide subscription.'
  },
  {
    id: 'lead-3',
    name: 'Bruce Wayne',
    company: 'Wayne Enterprises',
    email: 'bruce@wayne.corp',
    phone: '+1 (555) 911-1939',
    value: 250000,
    status: 'Proposal Sent',
    source: 'Referral',
    owner: 'Alex Rivera',
    lastContacted: '2026-06-11T18:00:00Z',
    createdAt: '2026-06-01T08:15:00Z',
    notes: 'Requires custom on-premise components. High contract value potential.'
  },
  {
    id: 'lead-4',
    name: 'Peter Parker',
    company: 'Daily Bugle Press',
    email: 'p.parker@dailybugle.com',
    phone: '+1 (555) 321-9876',
    value: 8500,
    status: 'Contacted',
    source: 'LinkedIn',
    owner: 'Sarah Chen',
    lastContacted: '2026-06-13T09:45:00Z',
    createdAt: '2026-06-05T14:20:00Z',
    notes: 'Sent initial discovery pricing grid. Follow up next Tuesday.'
  },
  {
    id: 'lead-5',
    name: 'Tony Stark',
    company: 'Stark Industries',
    email: 'tony@stark.ventures',
    phone: '+1 (555) 300-3000',
    value: 500000,
    status: 'New',
    source: 'Website',
    owner: 'Alex Rivera',
    lastContacted: '2026-06-15T12:00:00Z',
    createdAt: '2026-06-15T11:45:00Z',
    notes: 'Signed up through the sandbox platform. Needs dedicated cloud capacity details.'
  },
  {
    id: 'lead-6',
    name: 'Selina Kyle',
    company: 'Gotham Antiques',
    email: 'selina@kyle.net',
    phone: '+1 (555) 888-2424',
    value: 12000,
    status: 'Lost',
    source: 'Cold Call',
    owner: 'Marcus Vance',
    lastContacted: '2026-06-08T16:10:00Z',
    createdAt: '2026-05-18T10:00:00Z',
    notes: 'Decided to build an in-house open source tool instead of a commercial CRM license.'
  },
  {
    id: 'lead-7',
    name: 'Clark Kent',
    company: 'Planet Media Group',
    email: 'c.kent@dailyplanet.co',
    phone: '+1 (555) 902-8811',
    value: 35000,
    status: 'Meeting Scheduled',
    source: 'Referral',
    owner: 'Sarah Chen',
    lastContacted: '2026-06-14T10:15:00Z',
    createdAt: '2026-06-02T13:40:00Z',
    notes: 'Budget approved. Reviewing compliance document details.'
  }
];

const initialActivities = [
  {
    id: 'act-1',
    leadId: 'lead-5',
    leadName: 'Tony Stark',
    type: 'lead_created',
    content: 'Lead created via Website API Sandbox signup',
    timestamp: '2026-06-15T11:45:00Z'
  },
  {
    id: 'act-2',
    leadId: 'lead-2',
    leadName: 'Miles Dyson',
    type: 'status_change',
    content: 'Status updated from Qualified to Won',
    timestamp: '2026-06-14T15:20:00Z'
  },
  {
    id: 'act-3',
    leadId: 'lead-7',
    leadName: 'Clark Kent',
    type: 'note_added',
    content: 'Notes updated: Compliance details sent',
    timestamp: '2026-06-14T10:15:00Z'
  },
  {
    id: 'act-4',
    leadId: 'lead-4',
    leadName: 'Peter Parker',
    type: 'status_change',
    content: 'Status updated from New to Contacted',
    timestamp: '2026-06-13T09:45:00Z'
  },
  {
    id: 'act-5',
    leadId: 'lead-1',
    leadName: 'Sarah Connor',
    type: 'value_updated',
    content: 'Deal value increased from $35,000 to $48,000',
    timestamp: '2026-06-12T10:30:00Z'
  }
];

export function LeadProvider({ children }) {
  const [leads, setLeads] = useLocalStorage('crm-leads', initialLeads);
  const [activities, setActivities] = useLocalStorage('crm-activities', initialActivities);

  const logActivity = (leadId, leadName, type, content) => {
    const newActivity = {
      id: `act-${Date.now()}`,
      leadId,
      leadName,
      type,
      content,
      timestamp: new Date().toISOString()
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 50)); // Limit to last 50 activities
  };

  const addLead = (lead) => {
    const newLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastContacted: new Date().toISOString()
    };
    setLeads((prev) => [newLead, ...prev]);
    logActivity(newLead.id, newLead.name, 'lead_created', `Lead added with deal value $${newLead.value.toLocaleString()}`);
  };

  const updateLead = (id, updatedFields) => {
    let leadName = '';
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead.id === id) {
          leadName = lead.name;
          
          // Log changes
          if (updatedFields.status && updatedFields.status !== lead.status) {
            logActivity(id, lead.name, 'status_change', `Status updated from ${lead.status} to ${updatedFields.status}`);
          }
          if (updatedFields.value && Number(updatedFields.value) !== lead.value) {
            logActivity(id, lead.name, 'value_updated', `Deal value updated from $${lead.value.toLocaleString()} to $${Number(updatedFields.value).toLocaleString()}`);
          }
          if (updatedFields.notes && updatedFields.notes !== lead.notes) {
            logActivity(id, lead.name, 'note_added', `Notes updated: "${updatedFields.notes.slice(0, 30)}..."`);
          }

          return {
            ...lead,
            ...updatedFields,
            lastContacted: new Date().toISOString()
          };
        }
        return lead;
      })
    );
  };

  const deleteLead = (id) => {
    const leadToDelete = leads.find((l) => l.id === id);
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    if (leadToDelete) {
      logActivity(id, leadToDelete.name, 'status_change', `Lead removed from database`);
    }
  };

  return (
    <LeadContext.Provider value={{ leads, activities, addLead, updateLead, deleteLead }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}
