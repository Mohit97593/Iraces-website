# Frontend Integration Guide - Nested Sub-Questions API

## TypeScript Interfaces

```typescript
// types/forms.ts

export interface SubQuestionOption {
  label: string;
  price?: number;
  count?: number;
}

export interface SubQuestion {
  question_type?: number;
  title: string;
  form_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'email';
  mandatory: 0 | 1;
  options?: SubQuestionOption[];
  hint?: string;
  hint_type?: '1' | '2'; // 1 = text hint, 2 = image hint
  price_flag?: 0 | 1;
  count_flag?: 0 | 1;
  other_amount?: 0 | 1;
  sub_questions?: SubQuestion[]; // Recursive for nested questions
}

export interface AddGeneralFormQuestionRequest {
  event_id: number;
  user_id: number;
  general_form_id: number;
  form_name: number;
  display_label_name: string;
  question_mandatory_status: 0 | 1;
  sub_question_flag: 0 | 1;
  sub_questions?: SubQuestion[];
  
  // Optional fields
  limit_length_check?: boolean;
  min_length?: number;
  max_length?: number;
  field_mapping?: string;
  apply_ticket?: 0 | 1;
  ticket_selected_data?: any;
  main_question_hint?: string;
  hint_type?: '1' | '2';
  upload_hint_file?: File;
  date_range?: 0 | 1;
  range_start_date?: string;
  range_end_date?: string;
  specific_domain?: 0 | 1;
  domain_name?: string;
  question_group?: number | null;
}

export interface ApiResponse {
  data: any[];
  message: string;
}
```

---

## API Service (Axios)

```typescript
// services/formQuestionService.ts

import axios, { AxiosResponse } from 'axios';
import { AddGeneralFormQuestionRequest, ApiResponse } from '../types/forms';

const API_BASE_URL = 'http://localhost:8000/api';

export class FormQuestionService {
  
  /**
   * Add a general form question with nested sub-questions
   */
  static async addGeneralFormQuestion(
    request: AddGeneralFormQuestionRequest,
    authToken: string
  ): Promise<ApiResponse> {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('event_id', request.event_id.toString());
    formData.append('user_id', request.user_id.toString());
    formData.append('general_form_id', request.general_form_id.toString());
    formData.append('form_name', request.form_name.toString());
    formData.append('display_label_name', request.display_label_name);
    formData.append('question_mandatory_status', request.question_mandatory_status.toString());
    formData.append('sub_question_flag', request.sub_question_flag.toString());
    
    // Add sub-questions if present
    if (request.sub_questions && request.sub_questions.length > 0) {
      formData.append('sub_questions', JSON.stringify(request.sub_questions));
    }
    
    // Add optional fields
    if (request.apply_ticket !== undefined) {
      formData.append('apply_ticket', request.apply_ticket.toString());
    }
    
    if (request.question_group !== undefined && request.question_group !== null) {
      formData.append('question_group', request.question_group.toString());
    }
    
    if (request.upload_hint_file) {
      formData.append('upload_hint_file', request.upload_hint_file);
    }
    
    const response: AxiosResponse<ApiResponse> = await axios.post(
      `${API_BASE_URL}/AddGeneralFormQuestions`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    return response.data;
  }
}
```

---

## React Component Example

```tsx
// components/AddQuestionForm.tsx

import React, { useState } from 'react';
import { FormQuestionService } from '../services/formQuestionService';
import { SubQuestion } from '../types/forms';

export const AddQuestionForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmitSimpleNesting = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const subQuestions: SubQuestion[] = [
        {
          question_type: 1,
          title: "T-Shirt Size",
          form_type: "select",
          mandatory: 1,
          options: [
            { label: "Small" },
            { label: "Medium" },
            { label: "Large" }
          ],
          sub_questions: [
            {
              question_type: 1,
              title: "Delivery Address",
              form_type: "text",
              mandatory: 1
            }
          ]
        }
      ];

      const response = await FormQuestionService.addGeneralFormQuestion(
        {
          event_id: 1,
          user_id: 1,
          general_form_id: 100,
          form_name: 1,
          display_label_name: "Registration Details",
          question_mandatory_status: 1,
          sub_question_flag: 1,
          sub_questions: subQuestions
        },
        localStorage.getItem('authToken') || ''
      );

      setSuccess(true);
      console.log('Success:', response);
    } catch (err: any) {
      setError(err.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDeepNesting = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const subQuestions: SubQuestion[] = [
        {
          question_type: 1,
          title: "Meal Type",
          form_type: "select",
          mandatory: 1,
          options: [
            { label: "Vegetarian" },
            { label: "Non-Vegetarian" }
          ],
          sub_questions: [
            {
              question_type: 1,
              title: "Specific Dish",
              form_type: "select",
              mandatory: 0,
              options: [
                { label: "Option A" },
                { label: "Option B" }
              ],
              sub_questions: [
                {
                  question_type: 1,
                  title: "Special Instructions",
                  form_type: "textarea",
                  mandatory: 0
                }
              ]
            }
          ]
        }
      ];

      const response = await FormQuestionService.addGeneralFormQuestion(
        {
          event_id: 1,
          user_id: 1,
          general_form_id: 101,
          form_name: 1,
          display_label_name: "Meal Preferences",
          question_mandatory_status: 1,
          sub_question_flag: 1,
          sub_questions: subQuestions
        },
        localStorage.getItem('authToken') || ''
      );

      setSuccess(true);
      console.log('Success:', response);
    } catch (err: any) {
      setError(err.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-question-form">
      <h2>Add Nested Questions</h2>
      
      <button onClick={handleSubmitSimpleNesting} disabled={loading}>
        Add Simple Nesting (2 levels)
      </button>
      
      <button onClick={handleSubmitDeepNesting} disabled={loading}>
        Add Deep Nesting (3 levels)
      </button>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {success && <p style={{ color: 'green' }}>Question added successfully!</p>}
    </div>
  );
};
```

---

## Utility Functions

```typescript
// utils/questionBuilder.ts

import { SubQuestion } from '../types/forms';

/**
 * Helper to build nested sub-questions programmatically
 */
export class QuestionBuilder {
  
  /**
   * Create a simple text sub-question
   */
  static textQuestion(
    title: string,
    mandatory: 0 | 1 = 0,
    nestedQuestions?: SubQuestion[]
  ): SubQuestion {
    return {
      question_type: 1,
      title,
      form_type: 'text',
      mandatory,
      sub_questions: nestedQuestions
    };
  }
  
  /**
   * Create a select/dropdown sub-question
   */
  static selectQuestion(
    title: string,
    options: string[],
    mandatory: 0 | 1 = 0,
    nestedQuestions?: SubQuestion[]
  ): SubQuestion {
    return {
      question_type: 1,
      title,
      form_type: 'select',
      mandatory,
      options: options.map(label => ({ label })),
      sub_questions: nestedQuestions
    };
  }
  
  /**
   * Create a select question with prices
   */
  static selectQuestionWithPrices(
    title: string,
    options: Array<{ label: string; price: number }>,
    mandatory: 0 | 1 = 0,
    nestedQuestions?: SubQuestion[]
  ): SubQuestion {
    return {
      question_type: 1,
      title,
      form_type: 'select',
      mandatory,
      price_flag: 1,
      options: options,
      sub_questions: nestedQuestions
    };
  }
}

// Usage example:
const merchandiseQuestion = QuestionBuilder.selectQuestionWithPrices(
  "Merchandise",
  [
    { label: "T-Shirt", price: 500 },
    { label: "Cap", price: 300 }
  ],
  0,
  [
    QuestionBuilder.selectQuestion(
      "Size",
      ["S", "M", "L", "XL"],
      1
    )
  ]
);
```

---

## Ready-to-Use JSON Payloads

### Example 1: Two-Level Nesting

```json
{
  "event_id": 1,
  "user_id": 1,
  "general_form_id": 100,
  "form_name": 1,
  "display_label_name": "Registration Details",
  "question_mandatory_status": 1,
  "sub_question_flag": 1,
  "sub_questions": [
    {
      "question_type": 1,
      "title": "T-Shirt Size",
      "form_type": "select",
      "mandatory": 1,
      "options": [
        { "label": "Small" },
        { "label": "Medium" },
        { "label": "Large" }
      ],
      "sub_questions": [
        {
          "question_type": 1,
          "title": "Delivery Address",
          "form_type": "text",
          "mandatory": 1
        }
      ]
    }
  ]
}
```

### Example 2: Three-Level Deep Nesting

```json
{
  "event_id": 1,
  "user_id": 1,
  "general_form_id": 101,
  "form_name": 1,
  "display_label_name": "Meal Preferences",
  "question_mandatory_status": 1,
  "sub_question_flag": 1,
  "sub_questions": [
    {
      "question_type": 1,
      "title": "Meal Type",
      "form_type": "select",
      "mandatory": 1,
      "options": [
        { "label": "Vegetarian" },
        { "label": "Non-Vegetarian" }
      ],
      "sub_questions": [
        {
          "question_type": 1,
          "title": "Specific Dish",
          "form_type": "select",
          "mandatory": 0,
          "options": [
            { "label": "Option A" },
            { "label": "Option B" }
          ],
          "sub_questions": [
            {
              "question_type": 1,
              "title": "Special Instructions",
              "form_type": "textarea",
              "mandatory": 0
            }
          ]
        }
      ]
    }
  ]
}
```

### Example 3: Multiple Sub-Questions

```json
{
  "event_id": 1,
  "user_id": 1,
  "general_form_id": 102,
  "form_name": 1,
  "display_label_name": "Participation Details",
  "question_mandatory_status": 1,
  "sub_question_flag": 1,
  "sub_questions": [
    {
      "title": "Team Participation",
      "form_type": "select",
      "mandatory": 1,
      "options": [
        { "label": "Solo" },
        { "label": "Team" }
      ],
      "sub_questions": [
        {
          "title": "Team Name",
          "form_type": "text",
          "mandatory": 1
        }
      ]
    },
    {
      "title": "Previous Experience",
      "form_type": "select",
      "mandatory": 0,
      "options": [
        { "label": "Yes" },
        { "label": "No" }
      ],
      "sub_questions": [
        {
          "title": "Years of Experience",
          "form_type": "number",
          "mandatory": 0
        }
      ]
    }
  ]
}
```

---

## Fetch API Alternative (Vanilla JavaScript)

```javascript
// For those not using Axios

async function addGeneralFormQuestion(requestData, authToken) {
  const formData = new FormData();
  
  // Add basic fields
  formData.append('event_id', requestData.event_id);
  formData.append('user_id', requestData.user_id);
  formData.append('general_form_id', requestData.general_form_id);
  formData.append('form_name', requestData.form_name);
  formData.append('display_label_name', requestData.display_label_name);
  formData.append('question_mandatory_status', requestData.question_mandatory_status);
  formData.append('sub_question_flag', requestData.sub_question_flag);
  
  // Add sub-questions as JSON
  if (requestData.sub_questions) {
    formData.append('sub_questions', JSON.stringify(requestData.sub_questions));
  }
  
  try {
    const response = await fetch('http://localhost:8000/api/AddGeneralFormQuestions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
}

// Usage
const result = await addGeneralFormQuestion({
  event_id: 1,
  user_id: 1,
  general_form_id: 100,
  form_name: 1,
  display_label_name: "Registration Details",
  question_mandatory_status: 1,
  sub_question_flag: 1,
  sub_questions: [
    {
      title: "T-Shirt Size",
      form_type: "select",
      mandatory: 1,
      options: [
        { label: "Small" },
        { label: "Medium" }
      ]
    }
  ]
}, 'your_auth_token_here');
```

---

## Important Notes

### Maximum Nesting Depth
The API supports up to **5 levels** of nesting by default. Deeper nesting will be ignored.

### Form Types
Supported `form_type` values:
- `text` - Single-line text input
- `textarea` - Multi-line text input
- `select` - Dropdown selection
- `radio` - Radio buttons
- `checkbox` - Checkboxes
- `number` - Numeric input
- `date` - Date picker
- `email` - Email input

### Mandatory Field
- `0` = Optional
- `1` = Required

### Price Flags
When using `price_flag: 1`, include `price` in each option:
```typescript
{
  price_flag: 1,
  options: [
    { label: "T-Shirt", price: 500 },
    { label: "Cap", price: 300 }
  ]
}
```

---

## Error Handling

```typescript
try {
  const response = await FormQuestionService.addGeneralFormQuestion(request, token);
  
  if (response.message === 'Question added successfully') {
    // Handle success
    console.log('Question created successfully');
  }
} catch (error: any) {
  if (error.response) {
    // Server responded with error
    console.error('Server error:', error.response.data.message);
  } else if (error.request) {
    // Request made but no response
    console.error('No response from server');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

---

## Quick Start Checklist

- [ ] Copy TypeScript interfaces to your project
- [ ] Install Axios: `npm install axios`
- [ ] Update `API_BASE_URL` in service file
- [ ] Get authentication token from your auth system
- [ ] Test with Example 1 (simple 2-level nesting)
- [ ] Verify in database that hierarchy was created
- [ ] Integrate into your form builder UI

---

## Testing Tips

1. Start with simple 2-level nesting
2. Verify database entries after each test
3. Test backward compatibility with old format
4. Check that `parent_question_id` and `child_question_ids` are correctly set
5. Test with different form types (text, select, radio, etc.)
