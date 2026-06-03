# Chakra UI Design Patterns for RJSF Forms

Production-quality UI/UX patterns using `@rjsf/chakra-ui` theme or `@rjsf/core` with Chakra UI components.
Use these as reference when generating forms with `stylingApproach: "chakra"`.

---

## 1. Form Card Container

```tsx
import { Box, Heading, Text, Divider, VStack } from '@chakra-ui/react';

function FormCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Box maxW="780px" mx="auto" py={8} px={4}>
      <Box
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.200"
        px={{ base: 5, md: 10 }}
        py={{ base: 6, md: 8 }}
        shadow="sm"
      >
        <Heading as="h1" size="lg" fontWeight="700" color="gray.800" mb={1}>
          {title}
        </Heading>
        {subtitle && (
          <Text fontSize="sm" color="gray.500" mb={5}>
            {subtitle}
          </Text>
        )}
        <Divider mb={6} borderColor="gray.200" />
        {children}
      </Box>
    </Box>
  );
}
```

---

## 2. Section Grouping Styles

### Style A: Bordered Card Sections (recommended)

```tsx
import { Box, Heading, Text, SimpleGrid } from '@chakra-ui/react';
import type { ObjectFieldTemplateProps } from '@rjsf/utils';

const SECTION_COLUMNS: Record<string, { base: number; md: number; lg: number }> = {
  personalInfo: { base: 1, md: 2, lg: 2 },
  addressInfo: { base: 1, md: 2, lg: 2 },
  preferences: { base: 1, md: 1, lg: 1 },
};

const FULL_WIDTH_FIELDS = new Set(['bio', 'description', 'address']);

export function SectionTemplate(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const cols = SECTION_COLUMNS[sectionKey] ?? { base: 1, md: 1, lg: 1 };

  return (
    <Box
      as="fieldset"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="xl"
      p={{ base: 4, md: 5 }}
      mb={5}
      bg="gray.50"
      _hover={{ borderColor: 'gray.300' }}
      transition="border-color 0.2s"
    >
      {title && (
        <Heading
          as="legend"
          size="sm"
          fontWeight="600"
          color="gray.700"
          px={2}
          mb={1}
        >
          {title}
        </Heading>
      )}
      {description && (
        <Text fontSize="sm" color="gray.500" mb={3}>
          {description}
        </Text>
      )}
      <SimpleGrid columns={cols} spacing={{ base: 3, md: '16px 24px' }}>
        {properties.map((prop) =>
          prop.hidden ? null : (
            <Box
              key={prop.name}
              gridColumn={FULL_WIDTH_FIELDS.has(prop.name) ? '1 / -1' : undefined}
            >
              {prop.content}
            </Box>
          ),
        )}
      </SimpleGrid>
    </Box>
  );
}
```

### Style B: Flat Divider Sections (clean minimal)

```tsx
import { Box, Heading, Text, SimpleGrid, Divider } from '@chakra-ui/react';

export function FlatDividerSection(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const cols = SECTION_COLUMNS[sectionKey] ?? { base: 1, md: 1, lg: 1 };

  return (
    <Box mb={6}>
      {title && (
        <>
          <Heading
            size="xs"
            textTransform="uppercase"
            letterSpacing="wider"
            color="purple.600"
            fontWeight="700"
          >
            {title}
          </Heading>
          <Divider mt={1.5} mb={4} borderColor="purple.200" borderWidth="1.5px" />
        </>
      )}
      {description && (
        <Text fontSize="sm" color="gray.500" mb={3}>
          {description}
        </Text>
      )}
      <SimpleGrid columns={cols} spacing="16px 24px">
        {properties.map((prop) =>
          prop.hidden ? null : (
            <Box
              key={prop.name}
              gridColumn={FULL_WIDTH_FIELDS.has(prop.name) ? '1 / -1' : undefined}
            >
              {prop.content}
            </Box>
          ),
        )}
      </SimpleGrid>
    </Box>
  );
}
```

### Style C: Color-Banded Header Sections

```tsx
export function ColorBandedSection(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const cols = SECTION_COLUMNS[sectionKey] ?? { base: 1, md: 1, lg: 1 };

  return (
    <Box mb={5} borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.200">
      {title && (
        <Box bgGradient="linear(to-r, purple.500, purple.600)" px={5} py={3}>
          <Heading size="sm" color="white" fontWeight="600">
            {title}
          </Heading>
          {description && (
            <Text fontSize="sm" color="whiteAlpha.800" mt={0.5}>
              {description}
            </Text>
          )}
        </Box>
      )}
      <Box p={{ base: 4, md: 5 }} bg="white">
        <SimpleGrid columns={cols} spacing="16px 24px">
          {properties.map((prop) =>
            prop.hidden ? null : (
              <Box
                key={prop.name}
                gridColumn={FULL_WIDTH_FIELDS.has(prop.name) ? '1 / -1' : undefined}
              >
                {prop.content}
              </Box>
            ),
          )}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
```

---

## 3. Chakra CSS Overrides (`rjsf-overrides.css`)

```css
/* rjsf-overrides.css — Chakra UI theme polish */

.rjsf-form-card {
  max-width: 780px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 32px 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

@media (max-width: 640px) {
  .rjsf-form-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
}

/* Input styling */
.rjsf input,
.rjsf select,
.rjsf textarea {
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 8px 14px;
  font-size: 0.95rem;
  background: #fafbfc;
  transition: all 0.2s;
}

.rjsf input:hover,
.rjsf select:hover,
.rjsf textarea:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.rjsf input:focus,
.rjsf select:focus,
.rjsf textarea:focus {
  outline: none;
  border-color: #805ad5;
  box-shadow: 0 0 0 3px rgba(128, 90, 213, 0.15);
  background: #fff;
}

/* Labels */
.rjsf label {
  display: block;
  text-align: left;
  font-weight: 500;
  font-size: 0.875rem;
  color: #2d3748;
  margin-bottom: 4px;
}

/* Required asterisk */
.rjsf .chakra-form__required-indicator,
.rjsf .required {
  color: #e53e3e;
}

/* Help text */
.rjsf .chakra-form__helper-text,
.rjsf .help-block {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 4px;
}

/* Error text */
.rjsf .chakra-form__error-message,
.rjsf .text-danger {
  font-size: 0.8rem;
  color: #e53e3e;
  font-weight: 500;
  margin-top: 4px;
}

/* Error field border */
.rjsf .chakra-input[aria-invalid="true"],
.rjsf input[aria-invalid="true"] {
  border-color: #e53e3e;
  box-shadow: 0 0 0 1px #e53e3e;
}
```

---

## 4. Submit Button Patterns

### Style A: Right-Aligned with Gradient

```tsx
import { Box, Button, Spinner, HStack } from '@chakra-ui/react';

<HStack justify="flex-end" mt={8} pt={5} borderTop="1px solid" borderColor="gray.200" spacing={3}>
  <Button
    type="submit"
    size="lg"
    isLoading={status === 'loading'}
    loadingText="Submitting..."
    spinner={<Spinner size="sm" />}
    bgGradient="linear(to-r, purple.500, purple.600)"
    color="white"
    px={10}
    borderRadius="lg"
    fontWeight="600"
    _hover={{
      bgGradient: 'linear(to-r, purple.600, purple.700)',
      shadow: 'lg',
      transform: 'translateY(-1px)',
    }}
    _active={{ transform: 'translateY(0)' }}
    transition="all 0.2s"
  >
    Submit Application
  </Button>
</HStack>
```

### Style B: Full-Width

```tsx
<Box mt={8}>
  <Button
    type="submit"
    size="lg"
    width="full"
    colorScheme="purple"
    isLoading={status === 'loading'}
    loadingText="Processing..."
    borderRadius="lg"
    fontWeight="600"
    py={6}
    fontSize="md"
  >
    Submit
  </Button>
</Box>
```

### Style C: Split Save Draft + Submit

```tsx
<HStack justify="flex-end" mt={8} pt={5} borderTop="1px solid" borderColor="gray.200" spacing={3}>
  <Button
    variant="outline"
    size="lg"
    onClick={handleSaveDraft}
    borderColor="gray.300"
    color="gray.600"
    fontWeight="500"
    borderRadius="lg"
    _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
  >
    Save Draft
  </Button>
  <Button
    type="submit"
    size="lg"
    colorScheme="purple"
    isLoading={status === 'loading'}
    px={8}
    borderRadius="lg"
    fontWeight="600"
  >
    Submit
  </Button>
</HStack>
```

---

## 5. Step Indicator (Multi-Step Wizard)

```tsx
import { Box, HStack, Circle, Text, Flex, Divider } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

interface StepIndicatorProps {
  steps: { key: string; title: string }[];
  currentStep: number;
}

function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <HStack spacing={0} mb={8} justify="center">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;

        return (
          <Flex key={step.key} align="center">
            {i > 0 && (
              <Box
                w={{ base: '32px', md: '64px' }}
                h="2px"
                bg={isCompleted ? 'purple.500' : 'gray.200'}
                transition="background 0.3s"
              />
            )}
            <Flex direction="column" align="center" minW="80px">
              <Circle
                size="36px"
                bg={isCompleted ? 'purple.500' : isActive ? 'white' : 'gray.100'}
                border="2px solid"
                borderColor={isCompleted || isActive ? 'purple.500' : 'gray.300'}
                color={isCompleted ? 'white' : isActive ? 'purple.500' : 'gray.400'}
                fontWeight="700"
                fontSize="sm"
                transition="all 0.3s"
                shadow={isActive ? 'md' : 'none'}
              >
                {isCompleted ? <CheckIcon boxSize={3.5} /> : i + 1}
              </Circle>
              <Text
                fontSize="xs"
                mt={2}
                fontWeight={isActive ? '700' : '500'}
                color={isActive ? 'purple.600' : isCompleted ? 'purple.500' : 'gray.500'}
                textAlign="center"
              >
                {step.title}
              </Text>
            </Flex>
          </Flex>
        );
      })}
    </HStack>
  );
}
```

---

## 6. Success / Error Alerts

```tsx
import { Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Box, ScaleFade } from '@chakra-ui/react';

{/* Success */}
<ScaleFade in={status === 'success'} initialScale={0.95}>
  <Alert
    status="success"
    variant="subtle"
    borderRadius="xl"
    mb={5}
    py={4}
    alignItems="flex-start"
  >
    <AlertIcon boxSize={5} mt={0.5} />
    <Box flex="1">
      <AlertTitle fontWeight="600" fontSize="sm">Success</AlertTitle>
      <AlertDescription fontSize="sm" color="gray.600">
        Your form has been submitted successfully.
      </AlertDescription>
    </Box>
    <CloseButton
      size="sm"
      onClick={() => setStatus('idle')}
      position="relative"
      top={-1}
      right={-1}
    />
  </Alert>
</ScaleFade>

{/* Error */}
<ScaleFade in={status === 'error'} initialScale={0.95}>
  <Alert status="error" variant="subtle" borderRadius="xl" mb={5} py={4}>
    <AlertIcon boxSize={5} mt={0.5} />
    <Box flex="1">
      <AlertTitle fontWeight="600" fontSize="sm">Submission Failed</AlertTitle>
      <AlertDescription fontSize="sm">
        Please fix the errors below and try again.
      </AlertDescription>
    </Box>
    <CloseButton size="sm" onClick={() => setStatus('idle')} />
  </Alert>
</ScaleFade>
```

---

## 7. Empty Array State

```tsx
import { VStack, Box, Text, Button, Icon } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

function EmptyArrayState({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <VStack
      py={10}
      px={6}
      border="2px dashed"
      borderColor="gray.300"
      borderRadius="xl"
      bg="gray.50"
      spacing={3}
    >
      <Box
        w="56px"
        h="56px"
        borderRadius="full"
        bg="purple.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon as={AddIcon} color="purple.400" boxSize={5} />
      </Box>
      <Text fontWeight="500" color="gray.600">
        No {label} added yet
      </Text>
      <Text fontSize="sm" color="gray.400" textAlign="center" maxW="300px">
        Click the button below to add your first item.
      </Text>
      <Button
        variant="outline"
        colorScheme="purple"
        leftIcon={<AddIcon />}
        size="sm"
        borderRadius="lg"
        onClick={onAdd}
      >
        Add {label}
      </Button>
    </VStack>
  );
}
```

---

## 8. Array Item Card

```tsx
import { Box, HStack, IconButton, Badge } from '@chakra-ui/react';
import { DeleteIcon, DragHandleIcon } from '@chakra-ui/icons';

function ArrayItemCard({
  index,
  children,
  onRemove,
  canRemove,
  isDragging,
  dragListeners,
}: {
  index: number;
  children: React.ReactNode;
  onRemove: () => void;
  canRemove: boolean;
  isDragging?: boolean;
  dragListeners?: Record<string, unknown>;
}) {
  return (
    <HStack
      align="flex-start"
      spacing={2}
      p={3}
      mb={2}
      bg={isDragging ? 'purple.50' : 'white'}
      border="1px solid"
      borderColor={isDragging ? 'purple.200' : 'gray.200'}
      borderRadius="lg"
      shadow={isDragging ? 'lg' : 'none'}
      transition="all 0.2s"
      _hover={{ borderColor: 'gray.300' }}
    >
      <IconButton
        aria-label="Drag to reorder"
        icon={<DragHandleIcon />}
        size="sm"
        variant="ghost"
        color="gray.400"
        cursor="grab"
        {...dragListeners}
      />
      <Badge
        colorScheme="purple"
        borderRadius="full"
        px={2}
        py={0.5}
        fontSize="xs"
        fontWeight="700"
        mt={1}
      >
        {index + 1}
      </Badge>
      <Box flex="1" minW="0">{children}</Box>
      {canRemove && (
        <IconButton
          aria-label="Remove item"
          icon={<DeleteIcon />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: 'red.500', bg: 'red.50' }}
          onClick={onRemove}
        />
      )}
    </HStack>
  );
}
```

---

## 9. Complete Form Example — Contact Form (Chakra UI)

```tsx
import { useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import type { IChangeEvent } from '@rjsf/utils';
import {
  Box, Heading, Text, Divider, Button, Spinner,
  Alert, AlertIcon, AlertTitle, AlertDescription, ScaleFade,
} from '@chakra-ui/react';
import { schema } from './schema';
import { uiSchema } from './uiSchema';
import type { ContactFormData } from './types';
import { SectionTemplate } from './templates/SectionTemplate';
import './rjsf-overrides.css';

const templates = { ObjectFieldTemplate: SectionTemplate };

interface Props {
  onSubmit: (data: ContactFormData) => Promise<void>;
}

export function ContactForm({ onSubmit }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (data: IChangeEvent<ContactFormData>) => {
    if (!data.formData) return;
    setStatus('loading');
    try {
      await onSubmit(data.formData);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <Box maxW="780px" mx="auto" py={8} px={4}>
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.200" p={8} textAlign="center">
          <Box
            w="64px" h="64px" borderRadius="full" bg="green.50" mx="auto" mb={4}
            display="flex" alignItems="center" justifyContent="center"
          >
            <Text fontSize="2xl" color="green.500">&#10003;</Text>
          </Box>
          <Heading size="md" mb={2}>Message Sent</Heading>
          <Text color="gray.500">We'll get back to you within 24 hours.</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box maxW="780px" mx="auto" py={8} px={4}>
      <Box
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.200"
        px={{ base: 5, md: 10 }}
        py={{ base: 6, md: 8 }}
        shadow="sm"
      >
        <Heading as="h1" size="lg" fontWeight="700" color="gray.800" mb={1}>
          Contact Us
        </Heading>
        <Text fontSize="sm" color="gray.500" mb={5}>
          Have a question? Send us a message and we'll respond promptly.
        </Text>
        <Divider mb={6} />

        <ScaleFade in={status === 'error'} initialScale={0.95}>
          <Alert status="error" borderRadius="xl" mb={5}>
            <AlertIcon />
            <Box>
              <AlertTitle fontWeight="600">Failed to send</AlertTitle>
              <AlertDescription fontSize="sm">Please try again later.</AlertDescription>
            </Box>
          </Alert>
        </ScaleFade>

        <Form<ContactFormData>
          schema={schema}
          uiSchema={uiSchema}
          validator={validator}
          templates={templates}
          noHtml5Validate
          omitExtraData
          onSubmit={handleSubmit}
          showErrorList={false}
        >
          <Box mt={8} pt={5} borderTop="1px solid" borderColor="gray.200" textAlign="right">
            <Button
              type="submit"
              size="lg"
              isLoading={status === 'loading'}
              loadingText="Sending..."
              spinner={<Spinner size="sm" />}
              bgGradient="linear(to-r, purple.500, purple.600)"
              color="white"
              px={10}
              borderRadius="lg"
              fontWeight="600"
              _hover={{
                bgGradient: 'linear(to-r, purple.600, purple.700)',
                shadow: 'lg',
              }}
            >
              Send Message
            </Button>
          </Box>
        </Form>
      </Box>
    </Box>
  );
}
```

---

## Design Token Reference (Chakra UI)

| Token | Value | Usage |
|-------|-------|-------|
| Card border-radius | `2xl` (16px) | Form container |
| Section border-radius | `xl` (12px) | Section fieldsets |
| Input border-radius | `8px` / `lg` | All inputs, selects |
| Button border-radius | `lg` (8px) | Submit, nav buttons |
| Card padding | `32px 40px` desktop, `20px 16px` mobile | Form container |
| Grid spacing | `16px 24px` | Between fields |
| Section margin-bottom | `mb={5}` (20px) | Between sections |
| Input min-height | `44px` | WCAG touch target |
| Input background | `#fafbfc` idle, `#f7fafc` hover, `#fff` focus | Fields |
| Primary color | Purple scheme (`purple.500` = `#805ad5`) | Buttons, focus, indicators |
| Error color | `red.500` (`#e53e3e`) | Errors, required asterisk |
| Text heading | `gray.800` (`#1a202c`) | Headings |
| Text body | `gray.600` (`#4a5568`) | Body, labels |
| Text muted | `gray.500` (`#718096`) | Help text, descriptions |
| Focus ring | `0 0 0 3px rgba(128, 90, 213, 0.15)` | Input focus state |
