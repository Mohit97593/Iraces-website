import React from "react";
import "./EventsPanel.css";
import event2 from "../../assets/image/09cbb1e84b3bf91549ba83bb53aceeb0.jpg";

const EventsPanel = ({
  upcomingEvents = [],
  cityName = "Bengaluru",
  isLoading = false,
  likedEvents = {},
  onToggleLike = () => {},
}) => {
  return (
    <section className="events-panel py-5">
      <div className="container">
        <div className="section-head mb-4 text-start">
          <div className="upcoming-pill text-start">- UPCOMING EVENTS -</div>
          {/* <h2 className="events-heading">Upcoming Events</h2> */}
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : !upcomingEvents || upcomingEvents.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ marginBottom: "20px" }}>
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ margin: "0 auto", display: "block" }}
              >
                {/* Location pin icon with dashed circle */}
                <circle
                  cx="100"
                  cy="90"
                  r="40"
                  stroke="#ddd"
                  strokeWidth="3"
                  strokeDasharray="8 5"
                  fill="none"
                />
                {/* Clouds */}
                <ellipse cx="60" cy="50" rx="18" ry="12" fill="#e0e0e0" />
                <ellipse cx="72" cy="48" rx="15" ry="10" fill="#e0e0e0" />
                <ellipse cx="140" cy="55" rx="20" ry="13" fill="#e0e0e0" />
                <ellipse cx="155" cy="52" rx="18" ry="11" fill="#e0e0e0" />
                <ellipse cx="40" cy="140" rx="15" ry="10" fill="#e0e0e0" />
                {/* Location pin */}
                <path
                  d="M100 70 C90 70 82 78 82 88 C82 98 100 110 100 110 C100 110 118 98 118 88 C118 78 110 70 100 70 Z"
                  fill="#ccc"
                />
                <circle cx="100" cy="88" r="5" fill="white" />
                {/* Rain lines */}
                <line
                  x1="145"
                  y1="65"
                  x2="150"
                  y2="75"
                  stroke="#ddd"
                  strokeWidth="2"
                />
                <line
                  x1="152"
                  y1="65"
                  x2="157"
                  y2="75"
                  stroke="#ddd"
                  strokeWidth="2"
                />
                <line
                  x1="159"
                  y1="68"
                  x2="164"
                  y2="78"
                  stroke="#ddd"
                  strokeWidth="2"
                />
                <line
                  x1="166"
                  y1="65"
                  x2="171"
                  y2="75"
                  stroke="#ddd"
                  strokeWidth="2"
                />
                {/* Shadow */}
                <ellipse cx="100" cy="165" rx="35" ry="5" fill="#f0f0f0" />
              </svg>
            </div>
            <h4 className="mt-3" style={{ color: "#333", fontWeight: "600" }}>
              No events found
            </h4>
            <p className="text-muted" style={{ fontSize: "15px" }}>
              Sorry, We couldn't find any events that match your search, but
              here are some suggestions!
            </p>
          </div>
        ) : (
          <>
            <div
              id="upcomingEventsCarousel"
              className="carousel slide"
              data-bs-ride="false"
            >
              <div className="carousel-inner">
                {Array.from(
                  { length: Math.ceil(upcomingEvents.length / 4) },
                  (_, slideIndex) => {
                    const startIdx = slideIndex * 4;
                    const slideEvents = upcomingEvents.slice(
                      startIdx,
                      startIdx + 4
                    );
                    return (
                      <div
                        className={`carousel-item ${
                          slideIndex === 0 ? "active" : ""
                        }`}
                        key={slideIndex}
                      >
                        <div className="row justify-content-center">
                          {slideEvents.map((event) => {
                            const eventDate = new Date(event.start_time * 1000);
                            const month = eventDate.toLocaleString("en-US", {
                              month: "short",
                            });
                            const day = eventDate.getDate();
                            const registerByDate = new Date(
                              event.registration_end_time * 1000
                            );
                            const registerBy =
                              registerByDate.toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              });
                            const isOpen =
                              event.registration_end_time * 1000 > Date.now();

                            return (
                              <div
                                className="col-lg-3 col-md-6 col-12"
                                key={event.id}
                              >
                                <div className="event-card1">
                                  {/* Event Image */}
                                  <div className="event-card-img-wrapper">
                                    <img
                                      src={event.banner_image || event2}
                                      alt={event.name}
                                      className="event-card-img"
                                    />
                                    <span className="event-card-badge navi-mumbai-badge">
                                      <i
                                        className="fas fa-map-marker-alt"
                                        style={{ marginRight: 4 }}
                                      ></i>
                                      {event.city_name || cityName}
                                    </span>
                                    <button
                                      className={`search-like-btn${
                                        likedEvents[event.id] ? " liked" : ""
                                      }`}
                                      aria-label="Like"
                                      onClick={() => onToggleLike(event.id)}
                                    >
                                      <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M10 17.5C9.7 17.5 9.4 17.4 9.2 17.2L3.1 11.5C1.2 9.7 1.2 6.7 3.1 4.9C4.1 3.9 5.4 3.4 6.7 3.4C7.8 3.4 8.9 3.8 9.8 4.6C10.7 3.8 11.8 3.4 12.9 3.4C14.2 3.4 15.5 3.9 16.5 4.9C18.4 6.7 18.4 9.7 16.5 11.5L10.8 17.2C10.6 17.4 10.3 17.5 10 17.5Z"
                                          fill={
                                            likedEvents[event.id]
                                              ? "#da251c"
                                              : "#bbb"
                                          }
                                          stroke="#da251c"
                                          strokeWidth="1.2"
                                        />
                                      </svg>
                                    </button>
                                  </div>

                                  {/* Event Body */}
                                  <div className="event-card-body">
                                    <div className="event-header">
                                      <div className="event-date-wrapper">
                                        <div className="event-month">
                                          {month}
                                        </div>
                                        <div className="event-day">{day}</div>
                                      </div>
                                      <div className="event-title-wrapper">
                                        <h3 className="event-title">
                                          {event.name}
                                        </h3>
                                      </div>
                                    </div>

                                    <hr className="event-divider" />

                                    <div className="event-register-info">
                                      Register By :{" "}
                                      <span className="register-date">
                                        {registerBy}
                                      </span>
                                    </div>

                                    <div className="event-footer d-flex align-items-center justify-content-between">
                                      <span
                                        className="registration-status"
                                        style={{
                                          color: isOpen ? "green" : "#dc3545",
                                        }}
                                      >
                                        <i
                                          className={`fas fa-${
                                            isOpen ? "check-circle" : "ban"
                                          }`}
                                          style={{ marginRight: 6 }}
                                        ></i>
                                        {isOpen
                                          ? "Registration Open"
                                          : "Registration Closed"}
                                      </span>
                                      <button className="btn btn-view">
                                        Register
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Carousel Indicators (Dots) */}
              {upcomingEvents.length > 4 && (
                <div className="carousel-indicators">
                  {Array.from(
                    { length: Math.ceil(upcomingEvents.length / 4) },
                    (_, index) => (
                      <button
                        key={index}
                        type="button"
                        data-bs-target="#upcomingEventsCarousel"
                        data-bs-slide-to={index}
                        className={index === 0 ? "active" : ""}
                        aria-current={index === 0 ? "true" : "false"}
                        aria-label={`Slide ${index + 1}`}
                      ></button>
                    )
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default EventsPanel;
