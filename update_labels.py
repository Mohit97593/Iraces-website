import re
import os

file_path = r'c:\Users\sumit\OneDrive\Desktop\final-web\Iraces-website\src\pages\ParticipantDetails\ParticipantDetails.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find labels that don't already have the description span
# We look for <label> followed by {question.question_label}
# and ensure we don't match if question_description is already there.

pattern = r'(<label>\s*\{question\.question_label\})(?!\s*\{\s*question\.question_description)'

replacement = r'''\1
                    {question.question_description && (
                      <span style={{ fontSize: '12px', color: '#888', marginLeft: '5px', fontWeight: 'normal' }}>
                        ({question.question_description})
                      </span>
                    )}'''

new_content = re.sub(pattern, replacement, content)

# Count replacements
count = len(re.findall(pattern, content))
print(f"Applying {count} replacements...")

with open(file_path, 'w', encoding='utf-8', newline='') as f:
    f.write(new_content)

print("Done.")
