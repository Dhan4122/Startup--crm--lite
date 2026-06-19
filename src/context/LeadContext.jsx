import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

/**
 * @fileoverview LeadContext — global state management for CRM lead records.
 *
 * Lead object shape:
 * @typedef {Object} Lead
 * @property {string}  id        - Unique identifier (UUID)
 * @property {string}  name      - Full name of the lead contact
 * @property {string}  company   - Company / organisation name
 * @property {string}  email     - Contact email address
 * @property {string}  phone     - Contact phone number
 * @property {number}  value     - Estimated deal value in USD
 * @property {'New'|'Contacted'|'Meeting Scheduled'|'Proposal Sent'|'Won'|'Lost'} status
 *   - Current lifecycle stage of the lead
 * @property {'Website'|'Referral'|'LinkedIn'|'Cold Call'|'Email Campaign'|'Other'} source
 *   - Acquisition channel
 * @property {string}  owner        - Team member responsible for this lead
 * @property {string}  lastContacted - ISO 8601 date-time of last contact
 * @property {string}  createdAt     - ISO 8601 date-time when the lead was created
 * @property {string}  [notes]       - Optional free-text notes
 */

/**
 * Activity object shape:
 * @typedef {Object} Activity
 * @property {string} id        - Unique activity identifier
 * @property {string} leadId    - ID of the associated lead
 * @property {string} leadName  - Display name of the associated lead
 * @property {'lead_created'|'status_change'|'note_added'|'value_updated'} type
 * @property {string} content   - Human-readable description of the activity
 * @property {string} timestamp - ISO 8601 date-time when the activity occurred
 */

/** @type {Lead[]} */
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

/** @type {Activity[]} */
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

/**
 * The React Context object for lead data.
 * Consume via the `useLeads` hook — never use this directly.
 * @type {React.Context<{
 *   leads: Lead[],
 *   activities: Activity[],
 *   addLead: (lead: Omit<Lead, 'id'|'createdAt'|'lastContacted'>) => void,
 *   updateLead: (id: string, updatedFields: Partial<Lead>) => void,
 *   deleteLead: (id: string) => void,
 *   getLeadById: (id: string) => Lead | undefined
 * } | undefined>}
 */
const LeadContext = createContext(undefined);

/**
 * LeadProvider wraps the application (or a subtree) and supplies the
 * lead data store and all CRUD operations via context.
 *
 * State is persisted to `localStorage` under the key `'crm-leads'` so that
 * data survives page refreshes.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.JSX.Element}
 */
export function LeadProvider({ children }) {
  const [leads, setLeads] = useLocalStorage('crm-leads', initialLeads);
  const [activities, setActivities] = useLocalStorage('crm-activities', initialActivities);

  /**
   * Appends a new activity entry to the activity log.
   * The log is capped at 50 entries (most-recent first).
   *
   * @param {string} leadId   - ID of the lead this activity relates to
   * @param {string} leadName - Display name of the related lead
   * @param {Activity['type']} type - Category of activity
   * @param {string} content  - Human-readable activity description
   * @returns {void}
   */
  const logActivity = (leadId, leadName, type, content) => {
    /** @type {Activity} */
    const newActivity = {
      id: `act-${(typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now()}`,
      leadId,
      leadName,
      type,
      content,
      timestamp: new Date().toISOString()
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 50));
  };

  /**
   * Creates and persists a new lead record.
   * Automatically generates a unique `id` via `crypto.randomUUID()` (falling
   * back to `Date.now()` in environments that do not support the Web Crypto API)
   * and stamps `createdAt` / `lastContacted` with the current UTC time.
   *
   * @param {Omit<Lead, 'id'|'createdAt'|'lastContacted'>} lead
   *   - Lead data submitted from the creation form (without id / timestamps)
   * @returns {void}
   */
  const addLead = (lead) => {
    const uniqueId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `lead-${Date.now()}`;

    /** @type {Lead} */
    const newLead = {
      ...lead,
      id: uniqueId,
      createdAt: new Date().toISOString(),
      lastContacted: new Date().toISOString()
    };

    setLeads((prev) => [newLead, ...prev]);
    logActivity(
      newLead.id,
      newLead.name,
      'lead_created',
      `Lead added with deal value $${Number(newLead.value).toLocaleString()}`
    );
  };

  /**
   * Merges `updatedFields` into an existing lead record identified by `id`.
   * Side-effects:
   *  - Updates `lastContacted` to the current UTC time.
   *  - Logs a `status_change` activity when `status` differs from the previous value.
   *  - Logs a `value_updated` activity when `value` differs from the previous value.
   *  - Logs a `note_added` activity when `notes` differ from the previous value.
   *
   * @param {string} id - The unique identifier of the lead to update
   * @param {Partial<Lead>} updatedFields - Subset of lead fields to merge in
   * @returns {void}
   */
  const updateLead = (id, updatedFields) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead.id !== id) return lead;

        // Log discrete change events before merging
        if (updatedFields.status && updatedFields.status !== lead.status) {
          logActivity(id, lead.name, 'status_change', `Status updated from ${lead.status} to ${updatedFields.status}`);
        }
        if (updatedFields.value !== undefined && Number(updatedFields.value) !== lead.value) {
          logActivity(
            id,
            lead.name,
            'value_updated',
            `Deal value updated from $${lead.value.toLocaleString()} to $${Number(updatedFields.value).toLocaleString()}`
          );
        }
        if (updatedFields.notes !== undefined && updatedFields.notes !== lead.notes) {
          logActivity(
            id,
            lead.name,
            'note_added',
            `Notes updated: "${String(updatedFields.notes).slice(0, 30)}${updatedFields.notes.length > 30 ? '...' : ''}"`
          );
        }

        return {
          ...lead,
          ...updatedFields,
          lastContacted: new Date().toISOString()
        };
      })
    );
  };

  /**
   * Permanently removes a lead record from the store.
   * Logs a final `status_change` activity entry before deletion.
   *
   * @param {string} id - The unique identifier of the lead to delete
   * @returns {void}
   */
  const deleteLead = (id) => {
    const leadToDelete = leads.find((l) => l.id === id);
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    if (leadToDelete) {
      logActivity(id, leadToDelete.name, 'status_change', 'Lead removed from database');
    }
  };

  /**
   * Retrieves a single lead record by its unique identifier.
   * Returns `undefined` if no lead with the given `id` exists.
   *
   * @param {string} id - The unique identifier of the lead to retrieve
   * @returns {Lead | undefined}
   */
  const getLeadById = (id) => {
    return leads.find((lead) => lead.id === id);
  };

  return (
    <LeadContext.Provider value={{ leads, activities, addLead, updateLead, deleteLead, getLeadById }}>
      {children}
    </LeadContext.Provider>
  );
}

/**
 * Custom hook to consume the LeadContext.
 *
 * Must be called from within a component tree wrapped by `<LeadProvider>`.
 * Throws a descriptive error if invoked outside the provider boundary so that
 * missing provider bugs are caught early during development.
 *
 * @returns {{
 *   leads: Lead[],
 *   activities: Activity[],
 *   addLead: (lead: Omit<Lead, 'id'|'createdAt'|'lastContacted'>) => void,
 *   updateLead: (id: string, updatedFields: Partial<Lead>) => void,
 *   deleteLead: (id: string) => void,
 *   getLeadById: (id: string) => Lead | undefined
 * }}
 *
 * @throws {Error} When called outside of a `<LeadProvider>` component tree
 *
 * @example
 * function MyComponent() {
 *   const { leads, addLead } = useLeads();
 *   return <div>{leads.length} leads</div>;
 * }
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error(
      '[useLeads] This hook must be called inside a <LeadProvider> component. ' +
      'Wrap your application (or the relevant subtree) with <LeadProvider> to fix this error.'
    );
  }
  return context;
}

export { LeadContext };
