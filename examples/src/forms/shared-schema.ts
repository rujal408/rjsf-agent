import type { RJSFSchema } from '@rjsf/utils';

/**
 * Shared Employee Onboarding schema — same form across all frameworks for visual comparison.
 */
export const schema: RJSFSchema = {
  title: 'Employee Onboarding',
  description: 'Complete the form below to finalize the onboarding process.',
  type: 'object',
  required: ['personalInfo', 'address', 'emergencyContact', 'employment'],
  properties: {
    // ── Personal Information ─────────────────────────────────
    personalInfo: {
      type: 'object',
      title: 'Personal Information',
      description: 'Basic details about the employee.',
      required: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'],
      properties: {
        firstName: {
          type: 'string',
          title: 'First Name',
          minLength: 1,
        },
        lastName: {
          type: 'string',
          title: 'Last Name',
          minLength: 1,
        },
        email: {
          type: 'string',
          title: 'Email Address',
          format: 'email',
        },
        phone: {
          type: 'string',
          title: 'Phone Number',
          minLength: 7,
        },
        dateOfBirth: {
          type: 'string',
          title: 'Date of Birth',
          format: 'date',
        },
        gender: {
          type: 'string',
          title: 'Gender',
          oneOf: [
            { const: 'male', title: 'Male' },
            { const: 'female', title: 'Female' },
            { const: 'other', title: 'Other' },
            { const: 'prefer_not_to_say', title: 'Prefer not to say' },
          ],
        },
      },
    },

    // ── Address ──────────────────────────────────────────────
    address: {
      type: 'object',
      title: 'Address',
      description: 'Current residential address.',
      required: ['street', 'city', 'state', 'zip'],
      properties: {
        street: {
          type: 'string',
          title: 'Street Address',
        },
        city: {
          type: 'string',
          title: 'City',
        },
        state: {
          type: 'string',
          title: 'State',
          oneOf: [
            { const: 'CA', title: 'California' },
            { const: 'NY', title: 'New York' },
            { const: 'TX', title: 'Texas' },
            { const: 'FL', title: 'Florida' },
            { const: 'IL', title: 'Illinois' },
            { const: 'WA', title: 'Washington' },
            { const: 'PA', title: 'Pennsylvania' },
            { const: 'OH', title: 'Ohio' },
          ],
        },
        zip: {
          type: 'string',
          title: 'ZIP Code',
          pattern: '^[0-9]{5}(-[0-9]{4})?$',
        },
      },
    },

    // ── Emergency Contact (4-column demo) ─────────────────────
    emergencyContact: {
      type: 'object',
      title: 'Emergency Contact',
      description: 'Person to contact in case of an emergency.',
      required: ['contactName', 'relationship', 'contactPhone'],
      properties: {
        contactName: {
          type: 'string',
          title: 'Contact Name',
        },
        relationship: {
          type: 'string',
          title: 'Relationship',
          oneOf: [
            { const: 'spouse', title: 'Spouse' },
            { const: 'parent', title: 'Parent' },
            { const: 'sibling', title: 'Sibling' },
            { const: 'friend', title: 'Friend' },
            { const: 'other', title: 'Other' },
          ],
        },
        contactPhone: {
          type: 'string',
          title: 'Phone',
        },
        contactEmail: {
          type: 'string',
          title: 'Email',
          format: 'email',
        },
      },
    },

    // ── Employment Details ───────────────────────────────────
    employment: {
      type: 'object',
      title: 'Employment Details',
      description: 'Role and department information.',
      required: ['department', 'startDate'],
      properties: {
        department: {
          type: 'string',
          title: 'Department',
          oneOf: [
            { const: 'engineering', title: 'Engineering' },
            { const: 'design', title: 'Design' },
            { const: 'marketing', title: 'Marketing' },
            { const: 'sales', title: 'Sales' },
            { const: 'hr', title: 'Human Resources' },
            { const: 'finance', title: 'Finance' },
          ],
        },
        role: {
          type: 'string',
          title: 'Job Title',
        },
        startDate: {
          type: 'string',
          title: 'Start Date',
          format: 'date',
        },
        employmentType: {
          type: 'string',
          title: 'Employment Type',
          oneOf: [
            { const: 'full_time', title: 'Full-time' },
            { const: 'part_time', title: 'Part-time' },
            { const: 'contract', title: 'Contract' },
          ],
        },
        bio: {
          type: 'string',
          title: 'Short Bio',
          maxLength: 500,
        },
        agreeToTerms: {
          type: 'boolean',
          title: 'I agree to the company policies and code of conduct',
        },
      },
    },
  },
};

export const uiSchema = {
  personalInfo: {
    'ui:order': ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', '*'],
    firstName: {
      'ui:autofocus': true,
      'ui:placeholder': 'John',
    },
    lastName: {
      'ui:placeholder': 'Doe',
    },
    email: {
      'ui:placeholder': 'john.doe@company.com',
    },
    phone: {
      'ui:placeholder': '+1 (555) 123-4567',
    },
    gender: {
      'ui:widget': 'radio',
      'ui:options': { inline: true },
    },
  },
  address: {
    'ui:order': ['street', 'city', 'state', 'zip', '*'],
    street: {
      'ui:placeholder': '123 Main Street, Apt 4B',
    },
    city: {
      'ui:placeholder': 'San Francisco',
    },
    state: {
      'ui:placeholder': 'Select state',
    },
    zip: {
      'ui:placeholder': '94102',
      'ui:help': 'Format: 12345 or 12345-6789',
    },
  },
  emergencyContact: {
    'ui:order': ['contactName', 'relationship', 'contactPhone', 'contactEmail', '*'],
    contactName: { 'ui:placeholder': 'Jane Smith' },
    relationship: { 'ui:placeholder': 'Select relationship' },
    contactPhone: { 'ui:placeholder': '+1 (555) 987-6543' },
    contactEmail: { 'ui:placeholder': 'jane.smith@email.com' },
  },
  employment: {
    'ui:order': ['department', 'role', 'startDate', 'employmentType', 'bio', 'agreeToTerms', '*'],
    department: {
      'ui:placeholder': 'Select department',
    },
    role: {
      'ui:placeholder': 'e.g. Senior Software Engineer',
    },
    employmentType: {
      'ui:widget': 'radio',
      'ui:options': { inline: true },
    },
    bio: {
      'ui:widget': 'textarea',
      'ui:options': { rows: 4 },
      'ui:placeholder': 'Tell us a little about yourself and your background...',
      'ui:help': 'Max 500 characters. This will be shown on your internal profile.',
    },
  },
};

export interface EmployeeFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  emergencyContact: {
    contactName: string;
    relationship: string;
    contactPhone: string;
    contactEmail?: string;
  };
  employment: {
    department: string;
    role?: string;
    startDate: string;
    employmentType?: string;
    bio?: string;
    agreeToTerms?: boolean;
  };
}
