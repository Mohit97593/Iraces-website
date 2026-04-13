export const helpContent = {
  essentials: {
    title: "Event Essentials",
    content: `
      <p>This section helps you define the core details of your event.</p>
      <ul>
        <li><strong>Event Name:</strong> Enter the official name of your event (this will be visible to participants).</li>
        <li><strong>Event Category:</strong> Select the type of event (e.g., Running, Cycling, etc.) to help users easily identify it.</li>
        <li><strong>Visibility:</strong>
          <ul>
            <li><strong>Public</strong> – Anyone can view and register for the event</li>
            <li><strong>Private</strong> – Only selected users can access the event</li>
            <li><strong>Draft</strong> – Save progress without publishing</li>
          </ul>
        </li>
      </ul>
      <p>Make sure all details are accurate, as these will be displayed on the event page and registration screens.</p>
    `
  },
  scheduling: {
    title: "Event Scheduling",
    content: `
      <p>This section defines when and where your event will take place.</p>
      <ul>
        <li><strong>Location Details:</strong> Select the time zone, country, and enter the pincode to auto-fill state and city. Add the exact venue address for participants.</li>
        <li><strong>Google Map Embed Code (Optional):</strong> Paste the Google Maps embed link to help users easily locate your event.</li>
        <li><strong>Event Dates & Time:</strong> Set the start and end date/time of your event.</li>
        <li><strong>Registration Timeline:</strong> Define when registrations open and close. Participants will only be able to register within this period.</li>
      </ul>
      <p>Make sure your dates and timings are accurate to avoid confusion and ensure a smooth registration experience.</p>
    `
  },
  description: {
    title: "Event Description",
    content: `
      <p>This section helps you present your event to participants and attract registrations.</p>
      <ul>
        <li><strong>Event URL:</strong> This is your unique event page link. It will be shared with participants for registration.</li>
        <li><strong>Description:</strong> Provide a detailed overview of your event including highlights, categories, benefits, and key information. A clear and engaging description improves registrations.</li>
        <li><strong>Keywords/Metatags:</strong> Add relevant keywords to improve search visibility and discoverability of your event.</li>
        <li><strong>Event Banner:</strong> Upload a high-quality banner image that represents your event. This will be displayed on the event page and listings.</li>
        <li><strong>Communication Creatives (Optional):</strong> Upload additional images or creatives for promotions, emails, or announcements.</li>
        <li><strong>Banner Background:</strong> Enable this if you want the banner to be used as a background on the event page.</li>
      </ul>
      <p>Make sure your content is clear, engaging, and visually appealing to maximize participant interest.</p>
    `
  },
  settings: {
    title: "Event Settings",
    content: `
      <p>This section allows you to control how registrations are configured for your event.</p>
      <ul>
        <li><strong>Overall Limit:</strong> Set the maximum number of participants allowed across the event.</li>
        <li><strong>Single:</strong> Participant can register for only one race category (e.g., only 5K or 10K) at a time.</li>
        <li><strong>Multiple:</strong> Participant can register for multiple race categories (e.g., 5K + 10K + Half Marathon) at a time.</li>
        <li><strong>Unique Registrations:</strong> Enable this option to prevent duplicate registrations using the same participant details.</li>
      </ul>
      <p>Configure these settings based on your event structure and participation rules.</p>
    `
  },
  raceCategories: {
    title: "Race Categories & Pricing",
    content: `
      <h3>GST & Pricing Settings</h3>
      <ul>
        <li><strong>Collect GST on Registration Fee:</strong> Choose whether GST should be applied on the base registration amount.</li>
        <li><strong>Inclusive Taxes:</strong> GST is included in the registration fee. Users see a single final price.</li>
        <li><strong>Exclusive Taxes:</strong> GST is added separately. Users see a detailed price breakdown (base fee + GST + charges).</li>
      </ul>
      <h3>Race Categories</h3>
      <p>Create categories like 5K, 10K, Half Marathon, etc. Each category can have its own:</p>
      <ul>
        <li>Price, Participant limit, Registration dates, Booking limits, Deliverables (T-shirt, medal, bib)</li>
        <li>You can create both free and paid categories.</li>
      </ul>
      <h3>Advanced Settings</h3>
      <ul>
        <li>Decide who pays convenience & gateway fees</li>
        <li>Set age limits</li>
        <li>Configure early bird discounts</li>
        <li>Add custom messages for participants</li>
      </ul>
    `
  },
  formQuestions: {
    title: "Form Questions",
    content: `
      <p>This section allows you to customize the registration form and collect the information you need from participants.</p>
      <ul>
        <li><strong>Default Fields:</strong> Basic participant details (e.g., Name, Email, Mobile, DOB) are available by default. You can enable/disable them and mark fields as mandatory.</li>
        <li><strong>Add Custom Questions:</strong> Create additional questions based on your event needs (e.g., T-shirt size, medical info, preferences, donations).</li>
        <li><strong>Race Category-Based Questions:</strong> You can assign questions to specific race categories (e.g., 5K, 10K, Half Marathon). These questions will only be shown to participants registering for that selected category.</li>
        <li><strong>Field Controls:</strong> Enable/disable fields, Mark as mandatory or optional, Edit or delete custom questions.</li>
        <li><strong>Reordering:</strong> Drag and drop to change the order of questions in the registration form.</li>
      </ul>
      <p>Use this section to collect only the necessary information and keep the form simple for better user experience.</p>
    `
  },
  grouping: {
    title: "Grouping",
    content: `
      <p>This section allows you to organize your registration form questions into structured groups for better clarity and user experience.</p>
      <ul>
        <li><strong>Create Groups:</strong> Add groups such as Personal Details, Address Information, Medical Info, Emergency Contact, etc.</li>
        <li><strong>Better Organization:</strong> Grouping helps participants easily navigate the form instead of seeing all questions in one long list.</li>
        <li><strong>Assign Questions to Groups:</strong> You can assign form questions to specific groups based on their purpose.</li>
        <li><strong>Improved User Experience:</strong> Well-structured forms are easier to understand and increase completion rates.</li>
      </ul>
      <p>Click on “Add Group” to create a new section and start organizing your questions.</p>
    `
  },
  ageCategory: {
    title: "Age Category",
    content: `
      <p>This section allows you to define age groups for your event participants.</p>
      <ul>
        <li><strong>Create Age Categories:</strong> Add age ranges such as 18–25, 26–35, 36–50, etc.</li>
        <li><strong>Better Classification:</strong> Helps in grouping participants for results, rankings, or awards.</li>
        <li><strong>Category-Based Use:</strong> Age categories can be used for leaderboards, certificates, and performance comparisons.</li>
      </ul>
      <p>Click on “Add Age Category” to create and manage age groups.</p>
    `
  },
  coupons: {
    title: "Discount Coupons",
    content: `
      <p>This section allows you to create and manage discount codes for your event registrations.</p>
      <ul>
        <li><strong>Create Coupons:</strong> Add discount codes with either a fixed amount or percentage discount.</li>
        <li><strong>Usage Type:</strong>
          <ul>
            <li><strong>One-time use</strong> – Coupon can be used only once</li>
            <li><strong>Multiple use</strong> – Coupon can be used multiple times (limited by count)</li>
          </ul>
        </li>
        <li><strong>Coupon Settings:</strong> Set number of uses, Define validity (start & end date/time), Choose single code or multiple unique codes.</li>
        <li><strong>Visibility:</strong> Choose whether the coupon should be visible to users or shared privately.</li>
        <li><strong>Apply to Race Categories:</strong> Coupons can be applied to all race categories or only selected categories.</li>
      </ul>
      <p>Use coupons to boost registrations, promote offers, or reward specific participants.</p>
    `
  },
  communications: {
    title: "Communications",
    content: `
      <p>This section allows you to manage automated messages sent to participants during the event lifecycle.</p>
      <ul>
        <li><strong>Registration Confirmation:</strong> Send confirmation emails after successful registration.</li>
        <li><strong>Event Updates:</strong> Share important updates like BIB collection details and event day instructions.</li>
        <li><strong>Thank You Mailer:</strong> Send a follow-up message after the event to engage participants.</li>
        <li><strong>Custom Control:</strong> Enable or disable each communication based on your event needs.</li>
      </ul>
      <p>Use this to keep participants informed, engaged, and updated at every stage.</p>
    `
  },
  terms: {
    title: "Terms & Conditions",
    content: `
      <p>Add and enable terms that participants must agree to during registration.</p>
      <p>Helps ensure compliance and clear communication of event policies.</p>
    `
  },
  faqs: {
    title: "FAQ's",
    content: `
      <p>This section allows you to add frequently asked questions to help participants understand your event better.</p>
      <ul>
        <li><strong>Add Common Questions:</strong> Include questions related to registration, age limits, race categories, discounts, etc.</li>
        <li><strong>Improve User Experience:</strong> Helps participants quickly find answers without contacting support.</li>
        <li><strong>Custom & Flexible:</strong> You can create, edit, enable, or disable FAQs as needed.</li>
      </ul>
      <p>Use FAQs to reduce confusion and provide clear information to participants.</p>
    `
  }
};
