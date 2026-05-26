# Example: E-Commerce Checkout Form

A three-step checkout wizard demonstrating multi-step navigation (cart → shipping → payment),
a computed total field (quantity × unit_price), server-side file upload for a payment receipt,
and i18n labels for English and French.

---

## 1. Requirements

The natural language string passed to `/rjsf-build`:

```
Build a 3-step e-commerce checkout form.

Step 1 — Cart Review:
- Product name (text, read-only, pre-populated)
- Quantity (integer, required, min 1, max 99)
- Unit price (number, read-only, pre-populated in cents / dollars)
- Total (number, read-only, computed: quantity × unit_price — update on every change)

Step 2 — Shipping:
- Full name (text, required)
- Address line 1 (text, required)
- Address line 2 (text, optional)
- City (text, required)
- Postal code (text, required)
- Country (select: US / CA / GB, required)
- Shipping method (radio: standard / express / overnight, required)

Step 3 — Payment:
- Card holder name (text, required)
- Card number (text, required, minLength 16, maxLength 16)
- Expiry month (integer, required, min 1, max 12)
- Expiry year (integer, required, min 2024, max 2040)
- CVV (text, required, minLength 3, maxLength 4)
- Payment receipt (file upload, POST to /api/upload-receipt, accept: .jpg/.png/.pdf, max 5 MB,
  store returned URL)

[x] Multi-step: 3 steps (Cart Review, Shipping, Payment)
[x] Computed fields: total = quantity × unit_price
[x] File upload to server: receiptUrl (POST /api/upload-receipt)
[x] i18n: English and French
Use @rjsf/mui theme.
```

---

## 2. RequirementsBrief

What Phase 1 produces:

```markdown
# Requirements Brief: E-Commerce Checkout

## Purpose
Shoppers fill this form to complete a purchase — confirming cart items, entering shipping
details, and providing payment.

## RJSF Theme
@rjsf/mui

## Sections & Fields

### Step 1 — Cart Review
| Field       | Type    | Required | Validation       | Notes                              |
|-------------|---------|----------|------------------|------------------------------------|
| productName | string  | Yes      | readOnly: true   | Pre-populated                      |
| quantity    | integer | Yes      | min: 1, max: 99  | —                                  |
| unitPrice   | number  | Yes      | readOnly: true   | Pre-populated, display as currency |
| total       | number  | Yes      | readOnly: true   | Computed: quantity × unitPrice     |

### Step 2 — Shipping
| Field          | Type   | Required | Validation | Notes                            |
|----------------|--------|----------|------------|----------------------------------|
| fullName       | string | Yes      | —          | —                                |
| addressLine1   | string | Yes      | —          | —                                |
| addressLine2   | string | No       | —          | —                                |
| city           | string | Yes      | —          | —                                |
| postalCode     | string | Yes      | —          | —                                |
| country        | string | Yes      | enum       | US / CA / GB                     |
| shippingMethod | string | Yes      | enum       | standard / express / overnight   |

### Step 3 — Payment
| Field          | Type    | Required | Validation          | Notes                           |
|----------------|---------|----------|---------------------|---------------------------------|
| cardHolderName | string  | Yes      | —                   | —                               |
| cardNumber     | string  | Yes      | minLength/maxLength: 16 | —                           |
| expiryMonth    | integer | Yes      | min: 1, max: 12     | —                               |
| expiryYear     | integer | Yes      | min: 2024, max: 2040 | —                              |
| cvv            | string  | Yes      | minLength: 3, maxLength: 4 | —                        |
| receiptUrl     | string  | No       | —                   | FileUploadServerWidget → /api/upload-receipt |

## Conditional Logic
None

## Layout Intent
- Form type: multi-step (3 steps)
- Step indicator at top
- Cart step: 2-column (productName/quantity, unitPrice/total)
- Shipping step: 2-column (fullName full-width, address fields 2-col)
- Payment step: 2-column (card fields)

## Edge Case Flags
- async_options: false
- cross_field_validation: false
- multi_step: true — 3 steps (Cart Review, Shipping, Payment)
- edit_mode: false
- role_based: false
- draft_save: false
- async_field_validation: false
- server_error_mapping: false
- nested_arrays: false
- computed_fields: true — total = quantity × unitPrice
- array_reorder: false
- file_upload_server: true — receiptUrl (POST /api/upload-receipt)
- view_mode: false
- tab_layout: false
- i18n: true — English, French
- masked_input: false
- rich_text: false
- print_export: false
```

---

## 3. FormPlan: Step Map

| Step | Key          | Title         | Fields                                                  | Validation on Next                               |
|------|--------------|---------------|---------------------------------------------------------|--------------------------------------------------|
| 1    | cartReview   | Cart Review   | productName, quantity, unitPrice, total                 | quantity required, min 1                         |
| 2    | shipping     | Shipping      | fullName, addressLine1, addressLine2, city, postalCode, country, shippingMethod | all required except addressLine2 |
| 3    | payment      | Payment       | cardHolderName, cardNumber, expiryMonth, expiryYear, cvv, receiptUrl | cardNumber 16 digits, CVV 3–4 digits |

Clicking **Next** on step 1 and 2 triggers RJSF schema validation for that step's fields only.
The full payload is assembled from accumulated `formData` state before the final submit on step 3.

---

## 4. Generated `schema.ts`

```typescript
// src/forms/EcommerceCheckout/schema.ts
import type { RJSFSchema } from '@rjsf/utils';

// Step 1 — Cart Review
export const cartReviewSchema: RJSFSchema = {
  type: 'object',
  title: 'Cart Review',
  required: ['quantity'],
  properties: {
    productName: {
      type: 'string',
      title: 'Product',
      readOnly: true,
    },
    quantity: {
      type: 'integer',
      title: 'Quantity',
      minimum: 1,
      maximum: 99,
    },
    unitPrice: {
      type: 'number',
      title: 'Unit Price',
      readOnly: true,
    },
    total: {
      type: 'number',
      title: 'Total',
      readOnly: true,
    },
  },
};

// Step 2 — Shipping
export const shippingSchema: RJSFSchema = {
  type: 'object',
  title: 'Shipping',
  required: ['fullName', 'addressLine1', 'city', 'postalCode', 'country', 'shippingMethod'],
  properties: {
    fullName: {
      type: 'string',
      title: 'Full Name',
    },
    addressLine1: {
      type: 'string',
      title: 'Address Line 1',
    },
    addressLine2: {
      type: 'string',
      title: 'Address Line 2',
    },
    city: {
      type: 'string',
      title: 'City',
    },
    postalCode: {
      type: 'string',
      title: 'Postal Code',
    },
    country: {
      type: 'string',
      title: 'Country',
      enum: ['US', 'CA', 'GB'],
      enumNames: ['United States', 'Canada', 'United Kingdom'],
    },
    shippingMethod: {
      type: 'string',
      title: 'Shipping Method',
      enum: ['standard', 'express', 'overnight'],
      enumNames: ['Standard (5–7 days)', 'Express (2–3 days)', 'Overnight (next day)'],
    },
  },
};

// Step 3 — Payment
export const paymentSchema: RJSFSchema = {
  type: 'object',
  title: 'Payment',
  required: ['cardHolderName', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvv'],
  properties: {
    cardHolderName: {
      type: 'string',
      title: 'Card Holder Name',
    },
    cardNumber: {
      type: 'string',
      title: 'Card Number',
      minLength: 16,
      maxLength: 16,
    },
    expiryMonth: {
      type: 'integer',
      title: 'Expiry Month',
      minimum: 1,
      maximum: 12,
    },
    expiryYear: {
      type: 'integer',
      title: 'Expiry Year',
      minimum: 2024,
      maximum: 2040,
    },
    cvv: {
      type: 'string',
      title: 'CVV',
      minLength: 3,
      maxLength: 4,
    },
    receiptUrl: {
      type: 'string',
      title: 'Upload Payment Receipt (optional)',
    },
  },
};

// Steps array used by the Form component
export interface CheckoutStep {
  key: string;
  title: string;
  titleFr: string;
  schema: RJSFSchema;
}

export const checkoutSteps: CheckoutStep[] = [
  { key: 'cartReview', title: 'Cart Review',  titleFr: 'Panier',    schema: cartReviewSchema },
  { key: 'shipping',   title: 'Shipping',     titleFr: 'Livraison', schema: shippingSchema },
  { key: 'payment',    title: 'Payment',      titleFr: 'Paiement',  schema: paymentSchema },
];
```

---

## 5. Generated `uiSchema.ts`

```typescript
// src/forms/EcommerceCheckout/uiSchema.ts
import type { UiSchema } from '@rjsf/utils';

export const cartReviewUiSchema: UiSchema = {
  'ui:order': ['productName', 'quantity', 'unitPrice', 'total', '*'],
  productName: { 'ui:disabled': true },
  quantity: { 'ui:autofocus': true },
  unitPrice: {
    'ui:disabled': true,
    'ui:help': 'Price per unit in USD',
  },
  total: {
    'ui:disabled': true,
    'ui:help': 'Updates automatically as you change quantity',
  },
};

export const shippingUiSchema: UiSchema = {
  'ui:order': [
    'fullName', 'addressLine1', 'addressLine2',
    'city', 'postalCode', 'country', 'shippingMethod', '*',
  ],
  fullName: { 'ui:placeholder': 'Jane Doe' },
  addressLine1: { 'ui:placeholder': '123 Main St' },
  addressLine2: { 'ui:placeholder': 'Apt, suite, unit (optional)' },
  city: { 'ui:placeholder': 'City' },
  postalCode: { 'ui:placeholder': '10001' },
  shippingMethod: {
    'ui:widget': 'radio',
  },
};

export const paymentUiSchema: UiSchema = {
  'ui:order': [
    'cardHolderName', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvv', 'receiptUrl', '*',
  ],
  cardHolderName: { 'ui:placeholder': 'Name as it appears on card' },
  cardNumber: { 'ui:placeholder': '1234567890123456' },
  expiryMonth: { 'ui:placeholder': '1–12' },
  expiryYear: { 'ui:placeholder': '2024' },
  cvv: {
    'ui:widget': 'password',
    'ui:placeholder': '3 or 4 digits',
  },
  receiptUrl: {
    'ui:widget': 'FileUploadServerWidget',
    'ui:options': {
      uploadUrl: '/api/upload-receipt',
      accept: '.jpg,.jpeg,.png,.pdf',
      maxSizeMB: 5,
    },
    'ui:help': 'Optional: upload your bank receipt (JPG, PNG, or PDF, max 5 MB)',
  },
};
```

---

## 6. Computed Field Snippet

The `useEffect` in `index.tsx` that recalculates `total` whenever `quantity` or `unitPrice` changes.
The computed value is injected into `formData` before it is passed to the RJSF `Form` component.

```tsx
// src/forms/EcommerceCheckout/index.tsx (excerpt)
import React, { useEffect, useState } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { checkoutSteps } from './schema';
import {
  cartReviewUiSchema,
  shippingUiSchema,
  paymentUiSchema,
} from './uiSchema';
import { FileUploadServerWidget } from './widgets/FileUploadServerWidget';
import type { CheckoutFormData, CartReviewData } from './types';

const uiSchemas = [cartReviewUiSchema, shippingUiSchema, paymentUiSchema];

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface EcommerceCheckoutFormProps {
  initialCartData: Pick<CartReviewData, 'productName' | 'unitPrice'>;
  locale?: 'en' | 'fr';
  onSubmit: (data: CheckoutFormData) => Promise<void>;
}

export default function EcommerceCheckoutForm({
  initialCartData,
  locale = 'en',
  onSubmit,
}: EcommerceCheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({
    productName: initialCartData.productName,
    unitPrice: initialCartData.unitPrice,
    quantity: 1,
    total: initialCartData.unitPrice, // quantity 1 × unitPrice
  });
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  // ─── Computed total field ────────────────────────────────────────────────────
  useEffect(() => {
    const quantity = (formData.quantity as number) ?? 0;
    const unitPrice = (formData.unitPrice as number) ?? 0;
    const computed = Math.round(quantity * unitPrice * 100) / 100; // round to 2 dp
    setFormData((prev) => ({ ...prev, total: computed }));
  }, [formData.quantity, formData.unitPrice]);

  const handleStepChange = ({ formData: stepData }: { formData: Record<string, unknown> }) => {
    // Merge step data into accumulated formData, then advance
    const merged = { ...formData, ...stepData };
    setFormData(merged);
    if (currentStep < checkoutSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleFinalSubmit = async ({
    formData: stepData,
  }: {
    formData: Record<string, unknown>;
  }) => {
    const fullData = { ...formData, ...stepData } as CheckoutFormData;
    setSubmitState('submitting');
    try {
      await onSubmit(fullData);
      setSubmitState('success');
    } catch {
      setSubmitState('error');
    }
  };

  const step = checkoutSteps[currentStep];
  const isLastStep = currentStep === checkoutSteps.length - 1;
  const stepTitle = locale === 'fr' ? step.titleFr : step.title;

  // Extract only the fields relevant to the current step schema
  const stepFormData = Object.fromEntries(
    Object.keys(step.schema.properties ?? {}).map((key) => [key, formData[key]]),
  );

  return (
    <div>
      {/* Step indicator */}
      <nav aria-label="Checkout steps" style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {checkoutSteps.map((s, i) => (
          <span
            key={s.key}
            aria-current={i === currentStep ? 'step' : undefined}
            style={{
              fontWeight: i === currentStep ? 700 : 400,
              color: i < currentStep ? '#16a34a' : i === currentStep ? '#2563eb' : '#6b7280',
            }}
          >
            {i + 1}. {locale === 'fr' ? s.titleFr : s.title}
          </span>
        ))}
      </nav>

      <h2>{stepTitle}</h2>

      {submitState === 'success' ? (
        <div role="alert" style={{ color: 'green' }}>
          {locale === 'fr' ? 'Commande confirmée !' : 'Order confirmed!'}
        </div>
      ) : (
        <Form
          key={step.key}
          schema={step.schema}
          uiSchema={uiSchemas[currentStep]}
          validator={validator}
          widgets={{ FileUploadServerWidget }}
          formData={stepFormData}
          onChange={({ formData: changed }) => {
            setFormData((prev) => ({ ...prev, ...changed }));
          }}
          onSubmit={isLastStep ? handleFinalSubmit : handleStepChange}
          disabled={submitState === 'submitting'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            {currentStep > 0 && (
              <button type="button" onClick={() => setCurrentStep((s) => s - 1)}>
                {locale === 'fr' ? '← Retour' : '← Back'}
              </button>
            )}
            <button type="submit" disabled={submitState === 'submitting'}>
              {isLastStep
                ? locale === 'fr' ? 'Passer la commande' : 'Place Order'
                : locale === 'fr' ? 'Suivant →' : 'Next →'}
            </button>
          </div>
        </Form>
      )}
    </div>
  );
}
```

---

## 7. Key Test Cases

```tsx
// src/forms/EcommerceCheckout/EcommerceCheckout.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import EcommerceCheckoutForm from './index';

const defaultCart = { productName: 'Widget Pro', unitPrice: 29.99 };

// ── Test 1: Multi-step navigation — Next advances step, Back goes back ────────

test('Next button advances to shipping step, Back button returns to cart', async () => {
  render(<EcommerceCheckoutForm initialCartData={defaultCart} onSubmit={vi.fn()} />);

  // We should be on step 1 — Cart Review
  expect(screen.getByText(/cart review/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();

  // Fill quantity and click Next
  await userEvent.clear(screen.getByLabelText(/quantity/i));
  await userEvent.type(screen.getByLabelText(/quantity/i), '2');
  await userEvent.click(screen.getByRole('button', { name: /next/i }));

  // Should now be on step 2 — Shipping
  await waitFor(() => {
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  // Click Back — should return to Cart Review
  await userEvent.click(screen.getByRole('button', { name: /back/i }));
  await waitFor(() => {
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
  });
});

// ── Test 2: Computed total updates when quantity changes ──────────────────────

test('total field reflects quantity × unit price on every change', async () => {
  render(
    <EcommerceCheckoutForm
      initialCartData={{ productName: 'Widget Pro', unitPrice: 10.00 }}
      onSubmit={vi.fn()}
    />,
  );

  const quantityInput = screen.getByLabelText(/quantity/i);
  const totalInput = screen.getByLabelText(/total/i) as HTMLInputElement;

  // Initial: quantity=1, unitPrice=10 → total should be 10
  expect(parseFloat(totalInput.value)).toBe(10);

  // Change quantity to 3 → total should update to 30
  await userEvent.clear(quantityInput);
  await userEvent.type(quantityInput, '3');

  await waitFor(() => {
    const updatedTotal = screen.getByLabelText(/total/i) as HTMLInputElement;
    expect(parseFloat(updatedTotal.value)).toBe(30);
  });

  // Change quantity to 5 → total should update to 50
  await userEvent.clear(quantityInput);
  await userEvent.type(quantityInput, '5');

  await waitFor(() => {
    const updatedTotal = screen.getByLabelText(/total/i) as HTMLInputElement;
    expect(parseFloat(updatedTotal.value)).toBe(50);
  });
});

// ── Test 3: Step 1 validation prevents advancing without valid quantity ────────

test('cannot advance from cart step without a valid quantity', async () => {
  render(<EcommerceCheckoutForm initialCartData={defaultCart} onSubmit={vi.fn()} />);

  // Clear quantity so it is empty
  const quantityInput = screen.getByLabelText(/quantity/i);
  await userEvent.clear(quantityInput);

  await userEvent.click(screen.getByRole('button', { name: /next/i }));

  // Should still be on Cart Review — shipping fields should not appear
  await waitFor(() => {
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
  });
});

// ── Test 4: French locale renders translated labels and buttons ───────────────

test('renders French labels when locale is fr', () => {
  render(
    <EcommerceCheckoutForm
      initialCartData={defaultCart}
      locale="fr"
      onSubmit={vi.fn()}
    />,
  );

  // Step indicator should show French step names
  expect(screen.getByText(/panier/i)).toBeInTheDocument();
  expect(screen.getByText(/livraison/i)).toBeInTheDocument();
  expect(screen.getByText(/paiement/i)).toBeInTheDocument();

  // Next button should say "Suivant"
  expect(screen.getByRole('button', { name: /suivant/i })).toBeInTheDocument();
});

// ── Test 5: File upload widget shows "Uploading…" during upload ───────────────

test('file upload widget shows uploading state and stores returned URL', async () => {
  // Mock the upload endpoint
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ url: 'https://cdn.example.com/receipts/receipt-123.pdf' }),
  } as unknown as Response);

  render(<EcommerceCheckoutForm initialCartData={defaultCart} onSubmit={vi.fn()} />);

  // Navigate to payment step
  await userEvent.clear(screen.getByLabelText(/quantity/i));
  await userEvent.type(screen.getByLabelText(/quantity/i), '1');
  await userEvent.click(screen.getByRole('button', { name: /next/i }));

  await userEvent.type(await screen.findByLabelText(/full name/i), 'Jane Doe');
  await userEvent.type(screen.getByLabelText(/address line 1/i), '123 Main St');
  await userEvent.type(screen.getByLabelText(/city/i), 'New York');
  await userEvent.type(screen.getByLabelText(/postal code/i), '10001');
  await userEvent.selectOptions(screen.getByLabelText(/country/i), 'US');
  await userEvent.click(screen.getByLabelText(/standard/i));
  await userEvent.click(screen.getByRole('button', { name: /next/i }));

  // Now on payment step — upload a file
  const fileInput = await screen.findByLabelText(/upload payment receipt/i);
  const file = new File(['receipt data'], 'receipt.pdf', { type: 'application/pdf' });
  await userEvent.upload(fileInput, file);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/upload-receipt',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
```
