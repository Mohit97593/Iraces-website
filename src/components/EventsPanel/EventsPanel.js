import React from "react";
import "./EventsPanel.css";
import event1 from "../../assets/image/event1.jpg";
import event2 from "../../assets/image/09cbb1e84b3bf91549ba83bb53aceeb0.jpg";

const EventCard = ({ image, title, date, category, time, location }) => (
  <div className="event-card">
    <div className="ticket-col">
      <div className="ticket-label">TICKET</div>
      <div className="ticket-price">
        $50 <span className="per">/ Ticket</span>
      </div>
      <button className="register-btn">REGISTER NOW</button>
    </div>

    <div className="content-col">
      <h3 className="event-title">{title}</h3>
      <p className="event-desc">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus,
        luctus nec ullamcorper mattis.
      </p>

      <ul className="event-meta">
        <li>
          <i className="fa-regular fa-calendar meta-icon" /> {date}
        </li>
        <li>
          <i className="fa-regular fa-user meta-icon" /> {category}
        </li>
        <li>
          <i className="fa-regular fa-clock meta-icon" /> {time}
        </li>
        <li>
          <i className="fa-solid fa-location-dot meta-icon" /> {location}
        </li>
      </ul>
    </div>

    <div className="image-col">
      <img src={image} alt={title} />
    </div>
  </div>
);

const EventsPanel = () => {
  return (
    <section className="events-panel py-5">
      <div className="section-head text-center mb-4">
        <div className="upcoming-pill">- UPCOMING EVENTS -</div>
        <h2 className="events-heading">
          UPCOMING EVENTS - LACE UP FOR SOMETHING BIG
        </h2>
      </div>

      <div className="events-list">
        <EventCard
          image={event1}
          title="RUNMATE CITY SPRINT 10K"
          date="September 20, 2025"
          category="General"
          time="Start 05:00 AM - Finish"
          location="South Jekardah"
        />

        <EventCard
          image={event2}
          title="COASTAL HALF MARATHON"
          date="December 12, 2025"
          category="Member Only"
          time="Start 05:00 AM - Finish"
          location="Gadjah Mada Street"
        />
      </div>

      <div className="text-center mt-4">
        <button className="view-more">VIEW MORE EVENTS</button>
      </div>
    </section>
  );
};

export default EventsPanel;
