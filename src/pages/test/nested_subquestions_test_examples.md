# Nested Sub-Questions API - Test Examples

## API Endpoint
```
POST http://localhost:8000/api/AddGeneralFormQuestions
```

## Example 1: Simple 2-Level Nesting (T-Shirt → Address)

This creates a main question with a sub-question (T-Shirt Size) that has its own nested sub-question (Delivery Address).

```bash
curl -X POST http://localhost:8000/api/AddGeneralFormQuestions \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN_HERE" \
  -d "event_id=1" \
  -d "user_id=1" \
  -d "general_form_id=100" \
  -d "form_name=1" \
  -d "display_label_name=Registration Details" \
  -d "question_mandatory_status=1" \
  -d "sub_question_flag=1" \
  -d 'sub_questions=[
    {
      "question_type": 1,
      "title": "T-Shirt Size",
      "form_type": "select",
      "mandatory": 1,
      "options": [
        {"label": "Small"},
        {"label": "Medium"},
        {"label": "Large"}
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
  ]'
```

**Result:**
- Main Question: "Registration Details"
  - Sub-Question: "T-Shirt Size" (dropdown: Small/Medium/Large)
    - Nested Sub-Question: "Delivery Address" (text field)

---

## Example 2: Deep Nesting (3-Level)

Creates a hierarchy with 3 levels of nesting.

```bash
curl -X POST http://localhost:8000/api/AddGeneralFormQuestions \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN_HERE" \
  -d "event_id=1" \
  -d "user_id=1" \
  -d "general_form_id=101" \
  -d "form_name=1" \
  -d "display_label_name=Meal Preferences" \
  -d "question_mandatory_status=1" \
  -d "sub_question_flag=1" \
  -d 'sub_questions=[
    {
      "question_type": 1,
      "title": "Meal Type",
      "form_type": "select",
      "mandatory": 1,
      "options": [
        {"label": "Vegetarian"},
        {"label": "Non-Vegetarian"}
      ],
      "sub_questions": [
        {
          "question_type": 1,
          "title": "Specific Dish",
          "form_type": "select",
          "mandatory": 0,
          "options": [
            {"label": "Option A"},
            {"label": "Option B"}
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
  ]'
```

**Result:**
- Main Question: "Meal Preferences"
  - Sub-Question: "Meal Type" (Vegetarian/Non-Vegetarian)
    - Nested Sub-Question: "Specific Dish" (Option A/Option B)
      - Nested Sub-Question: "Special Instructions" (textarea)

---

## Example 3: Multiple Sub-Questions with Nesting

Creates multiple sub-questions where each can have their own nested questions.

```bash
curl -X POST http://localhost:8000/api/AddGeneralFormQuestions \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN_HERE" \
  -d "event_id=1" \
  -d "user_id=1" \
  -d "general_form_id=102" \
  -d "form_name=1" \
  -d "display_label_name=Participation Details" \
  -d "question_mandatory_status=1" \
  -d "sub_question_flag=1" \
  -d 'sub_questions=[
    {
      "title": "Team Participation",
      "form_type": "select",
      "mandatory": 1,
      "options": [
        {"label": "Solo"},
        {"label": "Team"}
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
        {"label": "Yes"},
        {"label": "No"}
      ],
      "sub_questions": [
        {
          "title": "Years of Experience",
          "form_type": "number",
          "mandatory": 0
        }
      ]
    }
  ]'
```

---

## Example 4: Backward Compatibility (Old Format)

The API still supports the old single sub-question format:

```bash
curl -X POST http://localhost:8000/api/AddGeneralFormQuestions \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN_HERE" \
  -d "event_id=1" \
  -d "user_id=1" \
  -d "general_form_id=103" \
  -d "form_name=1" \
  -d "display_label_name=Contact Information" \
  -d "question_mandatory_status=1" \
  -d "sub_question_flag=1" \
  -d "sub_question_title=Phone Number" \
  -d "sub_question_form_type=text" \
  -d "sub_question_mandatory_status=1"
```

---

## Example 5: With Price Flags (Merchandise)

Creating nested questions with price options:

```bash
curl -X POST http://localhost:8000/api/AddGeneralFormQuestions \
  -H "Content-Type": application/x-www-form-urlencoded" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN_HERE" \
  -d "event_id=1" \
  -d "user_id=1" \
  -d "general_form_id=104" \
  -d "form_name=1" \
  -d "display_label_name=Merchandise" \
  -d "question_mandatory_status=0" \
  -d "sub_question_flag=1" \
  -d 'sub_questions=[
    {
      "question_type": 1,
      "title": "Item Type",
      "form_type": "select",
      "mandatory": 0,
      "price_flag": 1,
      "options": [
        {"label": "T-Shirt", "price": 500},
        {"label": "Cap", "price": 300}
      ],
      "sub_questions": [
        {
          "question_type": 1,
          "title": "Size",
          "form_type": "select",
          "mandatory": 0,
          "options": [
            {"label": "S"},
            {"label": "M"},
            {"label": "L"}
          ]
        }
      ]
    }
  ]'
```

---

## Testing Database Queries

After creating nested questions, verify the hierarchy in the database:

```sql
-- View the hierarchy
SELECT 
    id,
    question_label,
    parent_question_id,
    child_question_ids,
    is_subquestion
FROM general_form_question
WHERE created_by = 1 AND parent_question_id IN (100, 101, 102)
ORDER BY parent_question_id, id;

-- Check parent-child relationships
SELECT 
    parent.id as parent_id,
    parent.question_label as parent_question,
    child.id as child_id,
    child.question_label as child_question,
    child.parent_question_id
FROM general_form_question child
LEFT JOIN general_form_question parent ON child.parent_question_id = parent.id
WHERE child.event_id = 1
ORDER BY parent.id, child.id;
```

---

## Important Notes

1. **Maximum Depth**: The API supports up to 5 levels of nesting by default
2. **Backward Compatible**: Old single sub-question format still works
3. **JSON Format**: The `sub_questions` parameter must be valid JSON
4. **Recursive**: Each sub-question can have its own `sub_questions` array
5. **Authentication**: Replace `YOUR_AUTH_TOKEN_HERE` with a valid token
6. **Testing**: Use appropriate `event_id`, `user_id`, and `general_form_id` values from your database
